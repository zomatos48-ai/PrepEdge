package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class TestReviewResponse {
    private Long testAttemptId;
    private String status;
    private Integer score;
    private int totalQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private List<TestReviewQuestionResponse> questions;
}