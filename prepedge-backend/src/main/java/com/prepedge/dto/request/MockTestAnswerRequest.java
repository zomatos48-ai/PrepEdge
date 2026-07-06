package com.prepedge.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MockTestAnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    // nullable — user may not have answered all questions before time ran out
    private Long selectedOptionId;
}