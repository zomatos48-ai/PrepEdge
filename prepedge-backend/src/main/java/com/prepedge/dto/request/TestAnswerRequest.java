package com.prepedge.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TestAnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotNull(message = "Selected option ID is required")
    private Long selectedOptionId;
}