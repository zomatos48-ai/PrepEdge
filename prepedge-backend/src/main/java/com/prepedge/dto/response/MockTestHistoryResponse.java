package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MockTestHistoryResponse {
    private Long attemptId;
    private String mockTestTitle;
    private String companyName;
    private String companySlug;
    private int score;
    private int totalQuestions;
    private double percentage;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
}
