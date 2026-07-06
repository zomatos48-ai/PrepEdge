package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TestHistoryResponse {
    private Long testAttemptId;
    private String subjectName;
    private String topicName;
    private String status;
    private Integer score;
    private int totalQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
}