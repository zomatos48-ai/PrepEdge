package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardEntryResponse {
    private int rank;
    private String username;
    private String college;
    private long totalAttempts;
    private long correctAttempts;
    private double accuracyPercentage;
    private long score;
    private boolean isCurrentUser;
}