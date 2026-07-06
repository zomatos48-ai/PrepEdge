package com.prepedge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mock_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @OneToMany(mappedBy = "mockTest", cascade = CascadeType.ALL,
               orphanRemoval = true)
    @OrderBy("questionOrder ASC")
    @Builder.Default
    private List<MockTestQuestion> questions = new ArrayList<>();
}