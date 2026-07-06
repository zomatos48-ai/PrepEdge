package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OptionResponse {
    private Long id;
    private String text;
    // isCorrect intentionally omitted — never expose the answer when listing questions
}