package com.ecothread.repository;

import com.ecothread.model.GarmentPassport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GarmentPassportRepository extends JpaRepository<GarmentPassport, Long> {
    Optional<GarmentPassport> findByPassportId(String passportId);
    List<GarmentPassport> findBySourceCampus(String sourceCampus);
    List<GarmentPassport> findByCurrentStage(String currentStage);
    List<GarmentPassport> findByFinalOutcome(String finalOutcome);
    List<GarmentPassport> findAllByOrderByCreatedAtDesc();
}
