package com.prepedge.controller;

import com.prepedge.dto.request.SubmitMockTestRequest;
import com.prepedge.dto.response.*;
import com.prepedge.service.MockTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mock-tests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MockTestController {

    private final MockTestService mockTestService;

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyResponse>> getCompanies() {
        return ResponseEntity.ok(mockTestService.getAllCompanies());
    }

    @GetMapping
    public ResponseEntity<List<MockTestResponse>> getMockTests(
            @RequestParam(required = false) Long companyId) {
        return ResponseEntity.ok(mockTestService.getAllMockTests(companyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MockTestDetailResponse> getMockTestDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(mockTestService.getMockTestDetail(id));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<MockTestStartResponse> startMockTest(
            @PathVariable Long id) {
        return ResponseEntity.ok(mockTestService.startMockTest(id));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<MockTestSubmitResponse> submitMockTest(
            @PathVariable Long attemptId,
            @Valid @RequestBody SubmitMockTestRequest request) {
        return ResponseEntity.ok(
                mockTestService.submitMockTest(attemptId, request));
    }

    @GetMapping("/attempts/{attemptId}/result")
    public ResponseEntity<MockTestResultResponse> getMockTestResult(
            @PathVariable Long attemptId) {
        return ResponseEntity.ok(mockTestService.getMockTestResult(attemptId));
    }
}