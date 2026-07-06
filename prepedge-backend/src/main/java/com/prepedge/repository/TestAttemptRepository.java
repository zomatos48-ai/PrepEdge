package com.prepedge.repository;

import com.prepedge.entity.TestAttempt;
import com.prepedge.entity.TestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    List<TestAttempt> findByUserIdOrderByStartedAtDesc(Long userId);
    long countByUserIdAndStatus(Long userId, TestStatus status);
}