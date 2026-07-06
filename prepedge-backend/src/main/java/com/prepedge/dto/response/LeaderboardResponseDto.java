package com.prepedge.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardResponseDto {
    private List<LeaderboardEntryDto> entries;
    private LeaderboardEntryDto currentUserEntry;  // always included even if outside top N
    private int totalParticipants;
    private String scope;   // "global" or college name
}