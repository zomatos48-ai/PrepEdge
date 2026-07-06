package com.prepedge.repository;

import com.prepedge.entity.MockTestAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MockTestAttemptAnswerRepository
        extends JpaRepository<MockTestAttemptAnswer, Long> {
    List<MockTestAttemptAnswer> findByMockTestAttemptId(Long mockTestAttemptId);
}