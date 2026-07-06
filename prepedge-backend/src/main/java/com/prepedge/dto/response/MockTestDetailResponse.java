package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class MockTestDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String companySlug;
    private int durationMinutes;
    private int totalQuestions;
    private List<QuestionResponse> questions;
}