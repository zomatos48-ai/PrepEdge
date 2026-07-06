package com.prepedge.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class SubmitMockTestRequest {

    @NotNull(message = "Answers are required")
    @Valid
    private List<MockTestAnswerRequest> answers;
}