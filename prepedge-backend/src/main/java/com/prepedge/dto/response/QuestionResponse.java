package com.prepedge.dto.response;

import com.prepedge.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private String text;
    private Difficulty difficulty;
    private String topicName;
    private String subjectName;
    private List<OptionResponse> options;
}