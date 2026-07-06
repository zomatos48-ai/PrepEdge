package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AttemptResponse {
    private boolean correct;
    private Long correctOptionId;
    private String explanation;
}