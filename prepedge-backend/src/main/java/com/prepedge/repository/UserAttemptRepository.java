package com.prepedge.repository;

import com.prepedge.entity.UserAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserAttemptRepository extends JpaRepository<UserAttempt, Long> {

    List<UserAttempt> findByUserId(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndCorrectTrue(Long userId);

    // Per-topic accuracy for a user — returns [topicName, subjectName, totalAttempts, correctAttempts]
    @Query("""
        SELECT
            t.name,
            s.name,
            COUNT(ua.id),
            SUM(CASE WHEN ua.correct = true THEN 1 ELSE 0 END)
        FROM UserAttempt ua
        JOIN ua.question q
        JOIN q.topic t
        JOIN t.subject s
        WHERE ua.user.id = :userId
        GROUP BY t.id, t.name, s.name
        HAVING COUNT(ua.id) >= :minAttempts
        ORDER BY (SUM(CASE WHEN ua.correct = true THEN 1 ELSE 0 END) * 1.0 / COUNT(ua.id)) ASC
        """)
    List<Object[]> findTopicAccuracyAscending(
            @Param("userId") Long userId,
            @Param("minAttempts") long minAttempts
    );

    @Query("""
        SELECT
            t.name,
            s.name,
            COUNT(ua.id),
            SUM(CASE WHEN ua.correct = true THEN 1 ELSE 0 END)
        FROM UserAttempt ua
        JOIN ua.question q
        JOIN q.topic t
        JOIN t.subject s
        WHERE ua.user.id = :userId
        GROUP BY t.id, t.name, s.name
        HAVING COUNT(ua.id) >= :minAttempts
        ORDER BY (SUM(CASE WHEN ua.correct = true THEN 1 ELSE 0 END) * 1.0 / COUNT(ua.id)) DESC
        """)
    List<Object[]> findTopicAccuracyDescending(
            @Param("userId") Long userId,
            @Param("minAttempts") long minAttempts
    );

    // Last N attempts for recent activity
    @Query("""
        SELECT ua FROM UserAttempt ua
        JOIN FETCH ua.question q
        JOIN FETCH q.topic t
        JOIN FETCH t.subject s
        WHERE ua.user.id = :userId
        ORDER BY ua.attemptedAt DESC
        LIMIT :limit
        """)
    List<UserAttempt> findRecentByUserId(
            @Param("userId") Long userId,
            @Param("limit") int limit
    );
    // Global leaderboard: all users ranked by correct answer count
    @Query(value = """
        SELECT
            u.id           AS userId,
            u.username     AS username,
            u.college      AS college,
            SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) AS score,
            COUNT(ua.id)   AS totalAttempts
        FROM user_attempts ua
        JOIN users u ON ua.user_id = u.id
        GROUP BY u.id, u.username, u.college
        ORDER BY score DESC
        """, nativeQuery = true)
    List<Object[]> findGlobalLeaderboard();

    // College-scoped leaderboard
    @Query(value = """
        SELECT
            u.id           AS userId,
            u.username     AS username,
            u.college      AS college,
            SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) AS score,
            COUNT(ua.id)   AS totalAttempts
        FROM user_attempts ua
        JOIN users u ON ua.user_id = u.id
        WHERE LOWER(u.college) = LOWER(:college)
        GROUP BY u.id, u.username, u.college
        ORDER BY score DESC
        """, nativeQuery = true)
    List<Object[]> findCollegeLeaderboard(@Param("college") String college);

    // All attempt dates for a user — needed to compute streak in service layer
    @Query(value = """
        SELECT DISTINCT CAST(ua.attempted_at AS date)
        FROM user_attempts ua
        WHERE ua.user_id = :userId
        ORDER BY 1 DESC
        """, nativeQuery = true)
    List<java.sql.Date> findDistinctAttemptDatesByUserId(@Param("userId") Long userId);
}