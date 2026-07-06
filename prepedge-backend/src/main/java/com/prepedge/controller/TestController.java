package com.prepedge.controller;

import com.prepedge.dto.request.StartTestRequest;
import com.prepedge.dto.request.SubmitTestRequest;
import com.prepedge.dto.response.*;
import com.prepedge.service.TestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestController {

    private final TestService testService;

    @PostMapping("/start")
    public ResponseEntity<TestStartResponse> startTest(@Valid @RequestBody StartTestRequest request) {
        return ResponseEntity.ok(testService.startTest(request));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<TestSubmitResponse> submitTest(
            @PathVariable Long id,
            @Valid @RequestBody SubmitTestRequest request) {
        return ResponseEntity.ok(testService.submitTest(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestReviewResponse> getTestAttempt(@PathVariable Long id) {
        return ResponseEntity.ok(testService.getTestAttempt(id));
    }

    @GetMapping("/history")
    public ResponseEntity<List<TestHistoryResponse>> getHistory() {
        return ResponseEntity.ok(testService.getTestHistory());
    }
}