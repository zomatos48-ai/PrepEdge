package com.prepedge.repository;

import com.prepedge.entity.TestAttemptQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestAttemptQuestionRepository extends JpaRepository<TestAttemptQuestion, Long> {
    List<TestAttemptQuestion> findByTestAttemptIdOrderByQuestionOrderAsc(Long testAttemptId);
}