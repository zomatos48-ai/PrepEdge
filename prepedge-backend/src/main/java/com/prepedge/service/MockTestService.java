package com.prepedge.service;

import com.prepedge.dto.request.MockTestAnswerRequest;
import com.prepedge.dto.request.SubmitMockTestRequest;
import com.prepedge.dto.response.*;
import com.prepedge.entity.*;
import com.prepedge.exception.ResourceNotFoundException;
import com.prepedge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MockTestService {

    private final CompanyRepository companyRepository;
    private final MockTestRepository mockTestRepository;
    private final MockTestQuestionRepository mockTestQuestionRepository;
    private final MockTestAttemptRepository mockTestAttemptRepository;
    private final MockTestAttemptAnswerRepository mockTestAttemptAnswerRepository;
    private final OptionRepository optionRepository;
    private final UserAttemptRepository userAttemptRepository;
    private final UserRepository userRepository;

    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(c -> new CompanyResponse(
                        c.getId(), c.getName(), c.getSlug(), c.getLogoUrl()))
                .collect(Collectors.toList());
    }

    public List<MockTestResponse> getAllMockTests(Long companyId) {
        List<MockTest> tests = companyId != null
                ? mockTestRepository.findByCompanyIdAndActiveTrue(companyId)
                : mockTestRepository.findByActiveTrue();

        return tests.stream()
                .map(this::toMockTestResponse)
                .collect(Collectors.toList());
    }

    public MockTestDetailResponse getMockTestDetail(Long mockTestId) {
        MockTest mockTest = mockTestRepository.findById(mockTestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Mock test not found: " + mockTestId));

        List<MockTestQuestion> mqList =
                mockTestQuestionRepository
                        .findByMockTestIdOrderByQuestionOrderAsc(mockTestId);

        List<QuestionResponse> questions = mqList.stream()
                .map(mq -> toQuestionResponse(mq.getQuestion()))
                .collect(Collectors.toList());

        return new MockTestDetailResponse(
                mockTest.getId(),
                mockTest.getTitle(),
                mockTest.getDescription(),
                mockTest.getCompany().getName(),
                mockTest.getCompany().getSlug(),
                mockTest.getDurationMinutes(),
                mockTest.getTotalQuestions(),
                questions);
    }

    @Transactional
    public MockTestStartResponse startMockTest(Long mockTestId) {
        User user = getCurrentUser();
        MockTest mockTest = mockTestRepository.findById(mockTestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Mock test not found: " + mockTestId));

        // If user already has an in-progress attempt, resume it instead of creating a new one
        var existingOpt = mockTestAttemptRepository.findByUserIdAndMockTestIdAndStatus(
                user.getId(), mockTestId, MockTestStatus.IN_PROGRESS);

        if (existingOpt.isPresent()) {
            MockTestAttempt existing = existingOpt.get();
            List<MockTestQuestion> mqList =
                    mockTestQuestionRepository
                            .findByMockTestIdOrderByQuestionOrderAsc(mockTestId);
            List<QuestionResponse> questions = mqList.stream()
                    .map(mq -> toQuestionResponse(mq.getQuestion()))
                    .collect(Collectors.toList());
            LocalDateTime expiresAt = existing.getStartedAt()
                    .plusMinutes(mockTest.getDurationMinutes());
            long remainingSeconds = Math.max(0, ChronoUnit.SECONDS.between(LocalDateTime.now(), expiresAt));
            return new MockTestStartResponse(
                    existing.getId(),
                    mockTest.getId(),
                    mockTest.getTitle(),
                    mockTest.getCompany().getName(),
                    mockTest.getDurationMinutes(),
                    mockTest.getTotalQuestions(),
                    existing.getStartedAt(),
                    expiresAt,
                    remainingSeconds,
                    questions);
        }

        MockTestAttempt attempt = MockTestAttempt.builder()
                .user(user)
                .mockTest(mockTest)
                .status(MockTestStatus.IN_PROGRESS)
                .build();

        attempt = mockTestAttemptRepository.save(attempt);

        // Pre-create answer slots for each question (null selectedOption until answered)
        List<MockTestQuestion> mqList =
                mockTestQuestionRepository
                        .findByMockTestIdOrderByQuestionOrderAsc(mockTestId);

        for (MockTestQuestion mq : mqList) {
            MockTestAttemptAnswer answer = MockTestAttemptAnswer.builder()
                    .mockTestAttempt(attempt)
                    .question(mq.getQuestion())
                    .build();
            mockTestAttemptAnswerRepository.save(answer);
        }

        List<QuestionResponse> questions = mqList.stream()
                .map(mq -> toQuestionResponse(mq.getQuestion()))
                .collect(Collectors.toList());

        LocalDateTime expiresAt = attempt.getStartedAt()
                .plusMinutes(mockTest.getDurationMinutes());
        long remainingSeconds = Math.max(0, ChronoUnit.SECONDS.between(LocalDateTime.now(), expiresAt));

        return new MockTestStartResponse(
                attempt.getId(),
                mockTest.getId(),
                mockTest.getTitle(),
                mockTest.getCompany().getName(),
                mockTest.getDurationMinutes(),
                mockTest.getTotalQuestions(),
                attempt.getStartedAt(),
                expiresAt,
                remainingSeconds,
                questions);
    }

    @Transactional
    public MockTestSubmitResponse submitMockTest(
            Long mockTestAttemptId, SubmitMockTestRequest request) {

        MockTestAttempt attempt = mockTestAttemptRepository
                .findById(mockTestAttemptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Mock test attempt not found: " + mockTestAttemptId));

        if (attempt.getStatus() != MockTestStatus.IN_PROGRESS) {
            throw new IllegalStateException("This attempt has already been submitted.");
        }

        User user = getCurrentUser();
        MockTest mockTest = attempt.getMockTest();

        // Determine if timed out
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = attempt.getStartedAt()
                .plusMinutes(mockTest.getDurationMinutes());
        boolean timedOut = now.isAfter(expiresAt);

        // Build answer map from request
        Map<Long, Long> answerMap = request.getAnswers() == null
                ? Map.of()
                : request.getAnswers().stream()
                        .filter(a -> a.getSelectedOptionId() != null)
                        .collect(Collectors.toMap(
                                MockTestAnswerRequest::getQuestionId,
                                MockTestAnswerRequest::getSelectedOptionId,
                                (a, b) -> a));

        List<MockTestAttemptAnswer> answerSlots =
                mockTestAttemptAnswerRepository
                        .findByMockTestAttemptId(mockTestAttemptId);

        int score = 0;
        int answered = 0;

        for (MockTestAttemptAnswer slot : answerSlots) {
            Long selectedOptionId = answerMap.get(slot.getQuestion().getId());

            if (selectedOptionId == null) {
                slot.setIsCorrect(false);
                continue;
            }

            Option selectedOption = optionRepository.findById(selectedOptionId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Option not found: " + selectedOptionId));

            Option correctOption = slot.getQuestion().getOptions().stream()
                    .filter(Option::isCorrect)
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "No correct option for question: "
                            + slot.getQuestion().getId()));

            boolean correct = selectedOption.getId().equals(correctOption.getId());
            slot.setSelectedOption(selectedOption);
            slot.setIsCorrect(correct);
            answered++;
            if (correct) score++;

            // Write to user_attempts for dashboard stats
            UserAttempt userAttempt = UserAttempt.builder()
                    .user(user)
                    .question(slot.getQuestion())
                    .selectedOption(selectedOption)
                    .correct(correct)
                    .build();
            userAttemptRepository.save(userAttempt);
        }

        mockTestAttemptAnswerRepository.saveAll(answerSlots);

        attempt.setScore(score);
        attempt.setSubmittedAt(now);
        attempt.setStatus(timedOut
                ? MockTestStatus.TIMED_OUT : MockTestStatus.SUBMITTED);
        mockTestAttemptRepository.save(attempt);

        double percentage = mockTest.getTotalQuestions() == 0 ? 0
                : Math.round((score * 100.0 / mockTest.getTotalQuestions()) * 10.0)
                  / 10.0;

        return new MockTestSubmitResponse(
                attempt.getId(),
                attempt.getStatus().name(),
                mockTest.getTotalQuestions(),
                answered,
                score,
                percentage);
    }

    public MockTestResultResponse getMockTestResult(Long mockTestAttemptId) {
        MockTestAttempt attempt = mockTestAttemptRepository
                .findById(mockTestAttemptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Mock test attempt not found: " + mockTestAttemptId));

        List<MockTestAttemptAnswer> answerSlots =
                mockTestAttemptAnswerRepository
                        .findByMockTestAttemptId(mockTestAttemptId);

        int answered = (int) answerSlots.stream()
                .filter(a -> a.getSelectedOption() != null).count();

        List<MockTestResultQuestionResponse> questionResults = answerSlots.stream()
                .map(slot -> {
                    Question q = slot.getQuestion();
                    // Seeded shuffle so exam and results always show options in the same order
                    List<OptionResponse> options = new ArrayList<>(q.getOptions().stream()
                            .map(o -> new OptionResponse(o.getId(), o.getText()))
                            .collect(Collectors.toList()));
                    Collections.shuffle(options, new Random(q.getId()));

                    Long correctOptionId = q.getOptions().stream()
                            .filter(Option::isCorrect)
                            .map(Option::getId)
                            .findFirst().orElse(null);

                    return new MockTestResultQuestionResponse(
                            q.getId(),
                            q.getText(),
                            options,
                            slot.getSelectedOption() != null
                                    ? slot.getSelectedOption().getId() : null,
                            correctOptionId,
                            slot.getIsCorrect(),
                            q.getExplanation(),
                            q.getTopic().getSubject().getName(),
                            q.getTopic().getName());
                })
                .collect(Collectors.toList());

        MockTest mockTest = attempt.getMockTest();
        int totalQ = mockTest.getTotalQuestions();
        double percentage = totalQ == 0 ? 0
                : Math.round((attempt.getScore() != null
                        ? attempt.getScore() : 0) * 100.0 / totalQ * 10.0) / 10.0;

        return new MockTestResultResponse(
                attempt.getId(),
                mockTest.getTitle(),
                mockTest.getCompany().getName(),
                attempt.getStatus().name(),
                totalQ,
                answered,
                attempt.getScore() != null ? attempt.getScore() : 0,
                percentage,
                mockTest.getDurationMinutes(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                questionResults);
    }

    public List<MockTestHistoryResponse> getMyHistory() {
        User user = getCurrentUser();
        List<MockTestAttempt> attempts =
                mockTestAttemptRepository.findByUserIdOrderByStartedAtDesc(user.getId());

        return attempts.stream().map(a -> {
            MockTest mt = a.getMockTest();
            int total = mt.getTotalQuestions();
            int sc = a.getScore() != null ? a.getScore() : 0;
            double pct = total == 0 ? 0
                    : Math.round(sc * 100.0 / total * 10.0) / 10.0;
            return new MockTestHistoryResponse(
                    a.getId(),
                    mt.getTitle(),
                    mt.getCompany().getName(),
                    mt.getCompany().getSlug(),
                    sc,
                    total,
                    pct,
                    a.getStatus().name(),
                    a.getStartedAt(),
                    a.getSubmittedAt());
        }).collect(Collectors.toList());
    }

    private MockTestResponse toMockTestResponse(MockTest m) {
        return new MockTestResponse(
                m.getId(),
                m.getTitle(),
                m.getDescription(),
                m.getCompany().getName(),
                m.getCompany().getSlug(),
                m.getDurationMinutes(),
                m.getTotalQuestions());
    }

    private QuestionResponse toQuestionResponse(Question q) {
        // Seeded shuffle: same questionId → same order every time (consistent between exam & results)
        List<OptionResponse> options = new ArrayList<>(q.getOptions().stream()
                .map(o -> new OptionResponse(o.getId(), o.getText()))
                .collect(Collectors.toList()));
        Collections.shuffle(options, new Random(q.getId()));
        return new QuestionResponse(
                q.getId(), q.getText(), q.getDifficulty(),
                q.getTopic().getName(),
                q.getTopic().getSubject().getName(),
                options);
    }

    private User getCurrentUser() {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }
}