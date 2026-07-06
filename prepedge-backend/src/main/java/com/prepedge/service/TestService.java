package com.prepedge.service;

import com.prepedge.dto.request.StartTestRequest;
import com.prepedge.dto.request.SubmitTestRequest;
import com.prepedge.dto.request.TestAnswerRequest;
import com.prepedge.dto.response.*;
import com.prepedge.entity.*;
import com.prepedge.exception.ResourceNotFoundException;
import com.prepedge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {

    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final TestAttemptQuestionRepository testAttemptQuestionRepository;
    private final UserAttemptRepository userAttemptRepository;
    private final UserRepository userRepository;

    @Transactional
    public TestStartResponse startTest(StartTestRequest request) {
        User user = getCurrentUser();
        String difficultyStr = request.getDifficulty() != null
                ? request.getDifficulty().name() : null;

        List<Question> questions = questionRepository.findRandomUnseen(
                request.getSubjectId(),
                request.getTopicId(),
                difficultyStr,
                user.getId(),
                request.getCount()
        );

        if (questions.size() < request.getCount()) {
            List<Question> fallback = questionRepository.findRandomAny(
                    request.getSubjectId(),
                    request.getTopicId(),
                    difficultyStr,
                    request.getCount()
            );
            questions = mergeUnique(questions, fallback, request.getCount());
        }

        if (questions.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No questions available for the selected filters");
        }

        Subject subject = request.getSubjectId() != null
                ? subjectRepository.findById(request.getSubjectId()).orElse(null)
                : null;
        Topic topic = request.getTopicId() != null
                ? topicRepository.findById(request.getTopicId()).orElse(null)
                : null;

        TestAttempt testAttempt = TestAttempt.builder()
                .user(user)
                .subject(subject)
                .topic(topic)
                .difficulty(request.getDifficulty())
                .totalQuestions(questions.size())
                .status(TestStatus.IN_PROGRESS)
                .build();

        testAttempt = testAttemptRepository.save(testAttempt);

        int order = 1;
        for (Question q : questions) {
            TestAttemptQuestion taq = TestAttemptQuestion.builder()
                    .testAttempt(testAttempt)
                    .question(q)
                    .questionOrder(order++)
                    .build();
            testAttemptQuestionRepository.save(taq);
        }

        List<QuestionResponse> questionResponses = questions.stream()
                .map(this::toQuestionResponse)
                .collect(Collectors.toList());

        return new TestStartResponse(
                testAttempt.getId(), questions.size(), questionResponses);
    }

    @Transactional
    public TestSubmitResponse submitTest(Long testAttemptId, SubmitTestRequest request) {
        TestAttempt testAttempt = testAttemptRepository.findById(testAttemptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Test attempt not found"));

        if (testAttempt.getStatus() == TestStatus.SUBMITTED) {
            throw new IllegalStateException("This test has already been submitted");
        }

        User user = getCurrentUser();

        Map<Long, Long> answerMap = request.getAnswers().stream()
                .collect(Collectors.toMap(
                        TestAnswerRequest::getQuestionId,
                        TestAnswerRequest::getSelectedOptionId));

        List<TestAttemptQuestion> taqList =
                testAttemptQuestionRepository
                        .findByTestAttemptIdOrderByQuestionOrderAsc(testAttemptId);

        int score = 0;

        for (TestAttemptQuestion taq : taqList) {
            Long selectedOptionId = answerMap.get(taq.getQuestion().getId());

            if (selectedOptionId == null) {
                taq.setIsCorrect(false);
                continue;
            }

            Option selectedOption = optionRepository.findById(selectedOptionId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Option not found: " + selectedOptionId));

            Option correctOption = taq.getQuestion().getOptions().stream()
                    .filter(Option::isCorrect)
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Question has no correct option configured"));

            boolean correct = selectedOption.getId().equals(correctOption.getId());

            taq.setSelectedOption(selectedOption);
            taq.setIsCorrect(correct);

            if (correct) score++;

            // Also write to user_attempts so Dashboard stats are populated
            UserAttempt userAttempt = UserAttempt.builder()
                    .user(user)
                    .question(taq.getQuestion())
                    .selectedOption(selectedOption)
                    .correct(correct)
                    .build();
            userAttemptRepository.save(userAttempt);
        }

        testAttemptQuestionRepository.saveAll(taqList);

        testAttempt.setScore(score);
        testAttempt.setStatus(TestStatus.SUBMITTED);
        testAttempt.setSubmittedAt(java.time.LocalDateTime.now());
        testAttemptRepository.save(testAttempt);

        double percentage = (score * 100.0) / testAttempt.getTotalQuestions();

        return new TestSubmitResponse(
                testAttempt.getId(),
                testAttempt.getTotalQuestions(),
                score,
                percentage);
    }

    public TestReviewResponse getTestAttempt(Long testAttemptId) {
        TestAttempt testAttempt = testAttemptRepository.findById(testAttemptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Test attempt not found"));

        List<TestAttemptQuestion> taqList =
                testAttemptQuestionRepository
                        .findByTestAttemptIdOrderByQuestionOrderAsc(testAttemptId);

        List<TestReviewQuestionResponse> questionReviews = taqList.stream()
                .map(taq -> {
                    Question q = taq.getQuestion();
                    List<OptionResponse> options = q.getOptions().stream()
                            .map(o -> new OptionResponse(o.getId(), o.getText()))
                            .collect(Collectors.toList());

                    Long correctOptionId = q.getOptions().stream()
                            .filter(Option::isCorrect)
                            .map(Option::getId)
                            .findFirst()
                            .orElse(null);

                    return new TestReviewQuestionResponse(
                            q.getId(),
                            q.getText(),
                            options,
                            taq.getSelectedOption() != null
                                    ? taq.getSelectedOption().getId() : null,
                            correctOptionId,
                            taq.getIsCorrect(),
                            q.getExplanation()
                    );
                })
                .collect(Collectors.toList());

        return new TestReviewResponse(
                testAttempt.getId(),
                testAttempt.getStatus().name(),
                testAttempt.getScore(),
                testAttempt.getTotalQuestions(),
                testAttempt.getStartedAt(),
                testAttempt.getSubmittedAt(),
                questionReviews);
    }

    public List<TestHistoryResponse> getTestHistory() {
        User user = getCurrentUser();
        return testAttemptRepository
                .findByUserIdOrderByStartedAtDesc(user.getId()).stream()
                .map(t -> new TestHistoryResponse(
                        t.getId(),
                        t.getSubject() != null ? t.getSubject().getName() : null,
                        t.getTopic() != null ? t.getTopic().getName() : null,
                        t.getStatus().name(),
                        t.getScore(),
                        t.getTotalQuestions(),
                        t.getStartedAt(),
                        t.getSubmittedAt()
                ))
                .collect(Collectors.toList());
    }

    private List<Question> mergeUnique(
            List<Question> primary, List<Question> fallback, int count) {
        List<Question> result = new java.util.ArrayList<>(primary);
        for (Question q : fallback) {
            if (result.size() >= count) break;
            if (result.stream().noneMatch(
                    existing -> existing.getId().equals(q.getId()))) {
                result.add(q);
            }
        }
        return result;
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    private QuestionResponse toQuestionResponse(Question q) {
        List<OptionResponse> optionResponses = q.getOptions().stream()
                .map(o -> new OptionResponse(o.getId(), o.getText()))
                .collect(Collectors.toList());

        return new QuestionResponse(
                q.getId(),
                q.getText(),
                q.getDifficulty(),
                q.getTopic().getName(),
                q.getTopic().getSubject().getName(),
                optionResponses);
    }
}