package com.prepedge.dto.request;

import com.prepedge.entity.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String text;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    private String explanation;

    @NotNull(message = "Topic ID is required")
    private Long topicId;

    @NotNull(message = "Options are required")
    @Size(min = 2, max = 6, message = "A question must have between 2 and 6 options")
    @Valid
    private List<OptionRequest> options;
}