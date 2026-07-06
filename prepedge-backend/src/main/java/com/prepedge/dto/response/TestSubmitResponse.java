package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TestSubmitResponse {
    private Long testAttemptId;
    private int totalQuestions;
    private int score;
    private double percentage;
}