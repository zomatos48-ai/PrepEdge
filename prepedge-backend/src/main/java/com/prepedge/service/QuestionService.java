package com.prepedge.service;

import com.prepedge.dto.request.AttemptRequest;
import com.prepedge.dto.request.QuestionRequest;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final TopicRepository topicRepository;
    private final OptionRepository optionRepository;
    private final SubjectRepository subjectRepository;
    private final UserAttemptRepository userAttemptRepository;
    private final UserRepository userRepository;

    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(s -> new SubjectResponse(s.getId(), s.getName()))
                .collect(Collectors.toList());
    }

    public List<TopicResponse> getTopicsBySubject(Long subjectId) {
        return topicRepository.findBySubjectId(subjectId).stream()
                .map(t -> new TopicResponse(t.getId(), t.getName(), t.getSubject().getId()))
                .collect(Collectors.toList());
    }

    public List<QuestionResponse> getQuestions(Long subjectId, Long topicId, Difficulty difficulty) {
        return questionRepository.findWithFilters(subjectId, topicId, difficulty).stream()
                .map(this::toQuestionResponse)
                .collect(Collectors.toList());
    }

    public int countQuestions(Long subjectId, Long topicId, Difficulty difficulty) {
        return questionRepository.findWithFilters(subjectId, topicId, difficulty).size();
    }

    public QuestionResponse getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return toQuestionResponse(question);
    }

    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request) {
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + request.getTopicId()));

        Question question = Question.builder()
                .text(request.getText())
                .difficulty(request.getDifficulty())
                .explanation(request.getExplanation())
                .topic(topic)
                .build();

        List<Option> options = request.getOptions().stream()
                .map(o -> Option.builder()
                        .text(o.getText())
                        .correct(o.isCorrect())
                        .question(question)
                        .build())
                .collect(Collectors.toList());

        question.setOptions(options);

        Question saved = questionRepository.save(question);
        return toQuestionResponse(saved);
    }

    @Transactional
    public AttemptResponse submitAttempt(AttemptRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        Option selectedOption = optionRepository.findById(request.getSelectedOptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Option not found"));

        Option correctOption = question.getOptions().stream()
                .filter(Option::isCorrect)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Question has no correct option configured"));

        boolean isCorrect = selectedOption.getId().equals(correctOption.getId());

        User currentUser = getCurrentUser();

        UserAttempt attempt = UserAttempt.builder()
                .user(currentUser)
                .question(question)
                .selectedOption(selectedOption)
                .correct(isCorrect)
                .build();

        userAttemptRepository.save(attempt);

        return new AttemptResponse(isCorrect, correctOption.getId(), question.getExplanation());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
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
                optionResponses
        );
    }
}