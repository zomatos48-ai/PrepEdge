package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class MockTestStartResponse {
    private Long mockTestAttemptId;
    private Long mockTestId;
    private String title;
    private String companyName;
    private int durationMinutes;
    private int totalQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;   // startedAt + durationMinutes, for frontend timer
    private long remainingSeconds;   // computed server-side; timezone-safe for frontend timer
    private List<QuestionResponse> questions;
}