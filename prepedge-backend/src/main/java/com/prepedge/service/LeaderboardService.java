package com.prepedge.service;

import com.prepedge.dto.response.LeaderboardEntryResponse;
import com.prepedge.dto.response.LeaderboardResponse;
import com.prepedge.entity.User;
import com.prepedge.exception.ResourceNotFoundException;
import com.prepedge.repository.UserAttemptRepository;
import com.prepedge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final UserAttemptRepository userAttemptRepository;

    public LeaderboardResponse getGlobalLeaderboard(String college) {
        User currentUser = getCurrentUser();

        List<User> users = college != null && !college.isBlank()
                ? userRepository.findByCollegeContainingIgnoreCase(college)
                : userRepository.findAll();

        List<LeaderboardEntryResponse> entries = new ArrayList<>();
        for (User user : users) {
            long total = userAttemptRepository.countByUserId(user.getId());
            long correct = userAttemptRepository.countByUserIdAndCorrectTrue(user.getId());
            long score = correct * 10L;
            double accuracy = total == 0 ? 0.0
                    : Math.round((correct * 100.0 / total) * 10.0) / 10.0;

            entries.add(new LeaderboardEntryResponse(
                    0, user.getUsername(), user.getCollege(),
                    total, correct, accuracy, score,
                    user.getId().equals(currentUser.getId())
            ));
        }

        entries.sort((a, b) -> {
            if (b.getScore() != a.getScore())
                return Long.compare(b.getScore(), a.getScore());
            return Double.compare(b.getAccuracyPercentage(), a.getAccuracyPercentage());
        });

        AtomicInteger rank = new AtomicInteger(1);
        entries.forEach(e -> e.setRank(rank.getAndIncrement()));

        LeaderboardEntryResponse currentUserEntry = entries.stream()
                .filter(LeaderboardEntryResponse::isCurrentUser)
                .findFirst()
                .orElse(null);

        List<LeaderboardEntryResponse> top50 = entries.stream()
                .limit(50)
                .toList();

        return new LeaderboardResponse(top50, currentUserEntry, entries.size());
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}