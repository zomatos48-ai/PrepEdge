package com.prepedge.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryDto {
    private int rank;
    private Long userId;
    private String username;
    private String college;
    private long score;          // correct answers
    private long totalAttempts;
    private double accuracy;     // score / totalAttempts * 100
    private int streak;          // consecutive days with at least 1 attempt
    private boolean isCurrentUser;
}