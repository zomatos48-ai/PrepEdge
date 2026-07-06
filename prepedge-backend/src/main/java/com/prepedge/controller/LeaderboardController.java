package com.prepedge.controller;

import com.prepedge.dto.response.LeaderboardResponse;
import com.prepedge.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<LeaderboardResponse> getLeaderboard(
            @RequestParam(required = false) String college) {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(college));
    }
}