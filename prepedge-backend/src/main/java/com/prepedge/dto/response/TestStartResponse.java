package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class TestStartResponse {
    private Long testAttemptId;
    private int totalQuestions;
    private List<QuestionResponse> questions;
}