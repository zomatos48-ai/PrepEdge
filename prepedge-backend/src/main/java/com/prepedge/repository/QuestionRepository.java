package com.prepedge.repository;

import com.prepedge.entity.Difficulty;
import com.prepedge.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("""
        SELECT q FROM Question q
        WHERE (:subjectId IS NULL OR q.topic.subject.id = :subjectId)
        AND (:topicId IS NULL OR q.topic.id = :topicId)
        AND (:difficulty IS NULL OR q.difficulty = :difficulty)
        """)
    List<Question> findWithFilters(
            @Param("subjectId") Long subjectId,
            @Param("topicId") Long topicId,
            @Param("difficulty") Difficulty difficulty
    );

    @Query(value = """
        SELECT q.* FROM questions q
        JOIN topics t ON q.topic_id = t.id
        WHERE (:subjectId IS NULL OR t.subject_id = :subjectId)
        AND (:topicId IS NULL OR q.topic_id = :topicId)
        AND (:difficulty IS NULL OR q.difficulty = :difficulty)
        AND q.id NOT IN (
            SELECT ua.question_id FROM user_attempts ua
            WHERE ua.user_id = :userId
            AND ua.attempted_at > NOW() - INTERVAL '7 days'
        )
        ORDER BY RANDOM()
        LIMIT :count
        """, nativeQuery = true)
    List<Question> findRandomUnseen(
            @Param("subjectId") Long subjectId,
            @Param("topicId") Long topicId,
            @Param("difficulty") String difficulty,
            @Param("userId") Long userId,
            @Param("count") int count
    );

    @Query(value = """
        SELECT q.* FROM questions q
        JOIN topics t ON q.topic_id = t.id
        WHERE (:subjectId IS NULL OR t.subject_id = :subjectId)
        AND (:topicId IS NULL OR q.topic_id = :topicId)
        AND (:difficulty IS NULL OR q.difficulty = :difficulty)
        ORDER BY RANDOM()
        LIMIT :count
        """, nativeQuery = true)
    List<Question> findRandomAny(
            @Param("subjectId") Long subjectId,
            @Param("topicId") Long topicId,
            @Param("difficulty") String difficulty,
            @Param("count") int count
    );

    List<Question> findByTextContainingIgnoreCase(String text);
}