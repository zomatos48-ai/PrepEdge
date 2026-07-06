package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class TestReviewQuestionResponse {
    private Long questionId;
    private String text;
    private List<OptionResponse> options;
    private Long selectedOptionId;
    private Long correctOptionId;
    private Boolean correct;
    private String explanation;
}