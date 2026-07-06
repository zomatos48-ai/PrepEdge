package com.prepedge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seed_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "filename", nullable = false, unique = true, length = 255)
    private String filename;

    @Column(name = "questions_imported")
    private int questionsImported;

    @Column(name = "imported_at")
    private LocalDateTime importedAt;

    @PrePersist
    public void prePersist() {
        this.importedAt = LocalDateTime.now();
    }
}