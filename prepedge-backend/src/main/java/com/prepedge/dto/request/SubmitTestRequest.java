package com.prepedge.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class SubmitTestRequest {

    @NotEmpty(message = "Answers are required")
    @Valid
    private List<TestAnswerRequest> answers;
}