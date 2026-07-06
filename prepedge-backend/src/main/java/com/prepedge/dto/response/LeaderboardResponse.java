package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class LeaderboardResponse {
    private List<LeaderboardEntryResponse> entries;
    private LeaderboardEntryResponse currentUserEntry;
    private long totalUsers;
}