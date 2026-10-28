package com.ecothread.service;

import com.ecothread.dto.CreatePassportRequest;
import com.ecothread.model.ConditionGrade;
import com.ecothread.model.GarmentPassport;
import com.ecothread.repository.GarmentPassportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class GarmentPassportService {

    private final GarmentPassportRepository passportRepository;

    public GarmentPassportService(GarmentPassportRepository passportRepository) {
        this.passportRepository = passportRepository;
    }

    @Transactional
    public GarmentPassport createPassport(CreatePassportRequest request) {
        String passportId = "ECO-TRC-" + LocalDateTime.now().getYear() + "-" + (int)(1000 + Math.random() * 9000);
        ConditionGrade grade = request.getConditionGrade() != null ? request.getConditionGrade() : ConditionGrade.GRADE_A;
        
        double weight = request.getWeightKg() != null ? request.getWeightKg() : 0.85;
        double waterSaved = weight * 7500.0;
        double co2Saved = weight * 3.6;

        String initialTimeline = buildTimelineJson(
                passportId,
                request.getSourceCampus() != null ? request.getSourceCampus() : "Campus Collection Drive",
                grade,
                request.getFinalOutcome() != null ? request.getFinalOutcome() : "REUSED_STUDENT_STORE",
                request.getDestinationPartner() != null ? request.getDestinationPartner() : "Campus Wardrobe Hub"
        );

        GarmentPassport passport = new GarmentPassport(
                passportId,
                request.getTitle(),
                request.getCategory(),
                request.getMaterialComposition(),
                weight,
                request.getSourceCampus(),
                grade,
                "QC_GRADED",
                request.getFinalOutcome(),
                request.getDestinationPartner(),
                waterSaved,
                co2Saved,
                request.getImageUrl(),
                initialTimeline
        );

        return passportRepository.save(passport);
    }

    public Optional<GarmentPassport> getPassportById(String passportId) {
        return passportRepository.findByPassportId(passportId);
    }

    public List<GarmentPassport> getAllPassports() {
        return passportRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public GarmentPassport updateStage(String passportId, String newStage, String outcome, String notes) {
        GarmentPassport passport = passportRepository.findByPassportId(passportId)
                .orElseThrow(() -> new IllegalArgumentException("Passport not found: " + passportId));

        passport.setCurrentStage(newStage);
        if (outcome != null && !outcome.isBlank()) {
            passport.setFinalOutcome(outcome);
        }

        // Append to timeline log
        String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        String updatedTimeline = passport.getTimelineLog() + 
                "\n• [" + nowStr + "] Stage updated to '" + newStage + "'. " + (notes != null ? notes : "");
        passport.setTimelineLog(updatedTimeline);

        return passportRepository.save(passport);
    }

    private String buildTimelineJson(String passportId, String campus, ConditionGrade grade, String outcome, String destination) {
        String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        return "• [" + nowStr + "] Collection registered at " + campus + " with unique Digital Passport " + passportId + "\n" +
               "• [" + nowStr + "] EcoGrade AI condition assessment completed: assigned " + grade + "\n" +
               "• [" + nowStr + "] Sanitization and warehouse intake recorded\n" +
               "• [" + nowStr + "] Target destination confirmed: " + destination + " (Outcome: " + outcome + ")";
    }
}
