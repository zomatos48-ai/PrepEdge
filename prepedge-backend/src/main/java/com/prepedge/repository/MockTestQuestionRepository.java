package com.prepedge.repository;

import com.prepedge.entity.MockTestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MockTestQuestionRepository
        extends JpaRepository<MockTestQuestion, Long> {
    List<MockTestQuestion> findByMockTestIdOrderByQuestionOrderAsc(Long mockTestId);
}