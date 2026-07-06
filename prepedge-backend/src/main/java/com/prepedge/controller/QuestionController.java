package com.prepedge.controller;

import com.prepedge.dto.request.AttemptRequest;
import com.prepedge.dto.request.QuestionRequest;
import com.prepedge.dto.response.*;
import com.prepedge.entity.Difficulty;
import com.prepedge.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getQuestions(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Difficulty difficulty) {
        return ResponseEntity.ok(questionService.getQuestions(subjectId, topicId, difficulty));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionResponse> createQuestion(@Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.createQuestion(request));
    }

    @PostMapping("/attempt")
    public ResponseEntity<AttemptResponse> submitAttempt(@Valid @RequestBody AttemptRequest request) {
        return ResponseEntity.ok(questionService.submitAttempt(request));
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectResponse>> getSubjects() {
        return ResponseEntity.ok(questionService.getAllSubjects());
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicResponse>> getTopics(@RequestParam Long subjectId) {
        return ResponseEntity.ok(questionService.getTopicsBySubject(subjectId));
    }

    @GetMapping("/count")
    public ResponseEntity<java.util.Map<String, Integer>> countQuestions(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Difficulty difficulty) {
        int count = questionService.countQuestions(subjectId, topicId, difficulty);
        return ResponseEntity.ok(java.util.Map.of("count", count));
    }
}