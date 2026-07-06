package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class MockTestResultResponse {
    private Long mockTestAttemptId;
    private String mockTestTitle;
    private String companyName;
    private String status;
    private int totalQuestions;
    private int answeredQuestions;
    private int score;
    private double percentage;
    private int durationMinutes;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private List<MockTestResultQuestionResponse> questions;
}