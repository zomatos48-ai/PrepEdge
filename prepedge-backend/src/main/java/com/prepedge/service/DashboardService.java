package com.prepedge.service;

import com.prepedge.dto.response.DashboardStatsResponse;
import com.prepedge.dto.response.RecentActivityResponse;
import com.prepedge.dto.response.TopicAccuracyResponse;
import com.prepedge.entity.TestStatus;
import com.prepedge.entity.User;
import com.prepedge.entity.UserAttempt;
import com.prepedge.exception.ResourceNotFoundException;
import com.prepedge.repository.TestAttemptRepository;
import com.prepedge.repository.UserAttemptRepository;
import com.prepedge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserAttemptRepository userAttemptRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getDashboardStats() {
        User user = getCurrentUser();
        Long userId = user.getId();

        long totalAttempts = userAttemptRepository.countByUserId(userId);
        long correctAttempts = userAttemptRepository.countByUserIdAndCorrectTrue(userId);
        double overallAccuracy = totalAttempts == 0 ? 0.0
                : Math.round((correctAttempts * 100.0 / totalAttempts) * 10.0) / 10.0;

        long totalTestsTaken = testAttemptRepository
                .countByUserIdAndStatus(userId, TestStatus.SUBMITTED);

        // Minimum 2 attempts per topic before it qualifies for weak/strong ranking
        // (avoids showing a topic as "100% strong" based on 1 lucky guess)
        long minAttempts = 2;

        List<TopicAccuracyResponse> weakTopics = userAttemptRepository
                .findTopicAccuracyAscending(userId, minAttempts)
                .stream()
                .limit(3)
                .map(this::toTopicAccuracy)
                .collect(Collectors.toList());

        List<TopicAccuracyResponse> strongTopics = userAttemptRepository
                .findTopicAccuracyDescending(userId, minAttempts)
                .stream()
                .limit(3)
                .map(this::toTopicAccuracy)
                .collect(Collectors.toList());

        List<RecentActivityResponse> recentActivity = userAttemptRepository
                .findRecentByUserId(userId, 5)
                .stream()
                .map(this::toRecentActivity)
                .collect(Collectors.toList());

        return new DashboardStatsResponse(
                totalAttempts,
                correctAttempts,
                overallAccuracy,
                totalTestsTaken,
                weakTopics,
                strongTopics,
                recentActivity
        );
    }

    private TopicAccuracyResponse toTopicAccuracy(Object[] row) {
        String topicName = (String) row[0];
        String subjectName = (String) row[1];
        long total = ((Number) row[2]).longValue();
        long correct = ((Number) row[3]).longValue();
        double accuracy = Math.round((correct * 100.0 / total) * 10.0) / 10.0;
        return new TopicAccuracyResponse(topicName, subjectName, total, correct, accuracy);
    }

    private RecentActivityResponse toRecentActivity(UserAttempt ua) {
        return new RecentActivityResponse(
                ua.getQuestion().getId(),
                ua.getQuestion().getText(),
                ua.getQuestion().getTopic().getName(),
                ua.getQuestion().getTopic().getSubject().getName(),
                ua.isCorrect(),
                ua.getAttemptedAt()
        );
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}