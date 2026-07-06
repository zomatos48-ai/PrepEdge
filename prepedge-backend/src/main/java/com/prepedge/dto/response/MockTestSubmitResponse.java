package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MockTestSubmitResponse {
    private Long mockTestAttemptId;
    private String status;
    private int totalQuestions;
    private int answeredQuestions;
    private int score;
    private double percentage;
}