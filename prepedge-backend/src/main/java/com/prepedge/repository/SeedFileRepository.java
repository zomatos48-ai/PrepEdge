package com.prepedge.repository;

import com.prepedge.entity.SeedFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeedFileRepository extends JpaRepository<SeedFile, Long> {
    boolean existsByFilename(String filename);
}