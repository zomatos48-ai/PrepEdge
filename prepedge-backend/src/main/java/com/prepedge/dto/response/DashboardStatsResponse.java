package com.prepedge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalAttempts;
    private long correctAttempts;
    private double overallAccuracy;
    private long totalTestsTaken;
    private List<TopicAccuracyResponse> weakTopics;
    private List<TopicAccuracyResponse> strongTopics;
    private List<RecentActivityResponse> recentActivity;
}