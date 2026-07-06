package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MockTestResponse {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String companySlug;
    private int durationMinutes;
    private int totalQuestions;
}