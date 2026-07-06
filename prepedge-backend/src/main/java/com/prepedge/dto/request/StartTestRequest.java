package com.prepedge.dto.request;

import com.prepedge.entity.Difficulty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartTestRequest {

    private Long subjectId;

    private Long topicId;

    private Difficulty difficulty;

    @NotNull(message = "Question count is required")
    @Min(value = 1, message = "Must request at least 1 question")
    @Max(value = 100, message = "Cannot request more than 100 questions")
    private Integer count;
}