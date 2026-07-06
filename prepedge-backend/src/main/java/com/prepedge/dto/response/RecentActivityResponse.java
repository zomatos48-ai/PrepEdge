package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RecentActivityResponse {
    private Long questionId;
    private String questionText;
    private String topicName;
    private String subjectName;
    private boolean correct;
    private LocalDateTime attemptedAt;
}