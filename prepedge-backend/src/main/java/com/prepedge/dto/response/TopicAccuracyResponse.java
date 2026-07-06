package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopicAccuracyResponse {
    private String topicName;
    private String subjectName;
    private long totalAttempts;
    private long correctAttempts;
    private double accuracyPercentage;
}