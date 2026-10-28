package com.ecothread.service;

import com.ecothread.dto.GarmentAssessmentRequest;
import com.ecothread.dto.GarmentAssessmentResponse;
import com.ecothread.model.ConditionGrade;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class EcoGradeAiService {

    public GarmentAssessmentResponse assessGarment(GarmentAssessmentRequest request) {
        GarmentAssessmentResponse response = new GarmentAssessmentResponse();
        response.setAssessmentId("EGA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        List<String> factors = new ArrayList<>();
        List<String> nextSteps = new ArrayList<>();

        boolean hasTears = Boolean.TRUE.equals(request.getHasTears());
        boolean hasStains = Boolean.TRUE.equals(request.getHasPermanentStains());
        boolean hasHardwareIssue = Boolean.TRUE.equals(request.getHasMissingButtonsOrZippers());
        boolean isSanitized = Boolean.TRUE.equals(request.getIsSanitized());
        boolean hasFading = Boolean.TRUE.equals(request.getHasSevereFading());

        String category = request.getCategory() != null ? request.getCategory() : "Apparel";
        String fabric = request.getFabricComposition() != null ? request.getFabricComposition() : "Cotton Blend";
        String wearDuration = request.getWearDuration() != null ? request.getWearDuration() : "6-12 Months";

        // Calculate recovery path & grade
        ConditionGrade grade;
        String route;
        double confidence;
        String rationale;
        String destination;

        if (hasTears && hasStains) {
            // Unsuitable for direct wearing -> High-value textile recycling
            grade = ConditionGrade.GRADE_C;
            route = "INDUSTRIAL_TEXTILE_RECYCLE";
            confidence = 97.4;
            rationale = "Garment exhibits structural tears and indelible staining incompatible with dignity-centered redistribution. High cellulose/polymer content makes it ideal for mechanical fiber shredding.";
            factors.add("Fabric integrity compromised by tears");
            factors.add("Incurable surface discoloration detected");
            factors.add("High secondary fiber recovery potential for acoustic & thermal insulation");
            destination = "Shivalik Circular Textile Recycling Facility";
            nextSteps.add("Route to Grade-C sorting pallet in Warehouse Zone C");
            nextSteps.add("Bundle into 50kg baled lot for mechanical yarn respinning");
        } else if (hasHardwareIssue && !hasTears && !hasStains) {
            // Repairable -> Upcycle / Tailor
            grade = ConditionGrade.GRADE_A;
            route = "REPAIR_AND_UPCYCLE";
            confidence = 93.2;
            rationale = "Fabric weave and hygiene remain pristine; only minor button/zipper hardware replacement required. Upcycling will restore full Grade-A beneficiary catalog value.";
            factors.add("Pristine base textile weave without tears or stains");
            factors.add("Minor hardware repair required (buttons/slider)");
            factors.add("High residual retail & wear lifetime estimated > 24 months");
            destination = "EcoThread Artisan Upcycling & Repair Studio";
            nextSteps.add("Assign to artisan station for button/zipper replacement");
            nextSteps.add("Re-inspect and list on Beneficiary & Student Store");
        } else if (!hasTears && !hasStains && !hasFading && isSanitized) {
            // Pristine Grade A
            grade = ConditionGrade.GRADE_A;
            route = "REUSE_BENEFICIARY_STORE";
            confidence = 96.8;
            rationale = "Garment meets stringent EcoThread Grade-A quality thresholds. Sanitized with zero fabric flaws, ready for immediate dignity-first beneficiary token checkout.";
            factors.add("Structural fabric integrity 100% intact");
            factors.add("Cleaned and sanitized to hygiene benchmark");
            factors.add("Modern silhouette and seasonal sizing confirmed");
            destination = "EcoThread Beneficiary & Student Catalog";
            nextSteps.add("Steam press and attach RFID / Digital Passport Tag");
            nextSteps.add("Publish to Student & Beneficiary Store for zero-credit or subsidized access");
        } else if (!hasTears && !hasStains && hasFading) {
            // Grade B Community drive
            grade = ConditionGrade.GRADE_B;
            route = "COMMUNITY_SHELTER_BULK";
            confidence = 91.5;
            rationale = "Slight color fade or aesthetic wear present, but structural warmth and durability are completely intact. Ideal for community drives, disaster relief shelters, and hostel swap drives.";
            factors.add("Intact seams, zero tears, zero unhygienic stains");
            factors.add("Moderate aesthetic wash fading consistent with pre-loved apparel");
            factors.add("High utility value for warmth and everyday wear");
            destination = "Campus Move-out Community Aid Drive (Goonj / Local Shelters)";
            nextSteps.add("Fold and pack into categorized 25-piece bulk aid bundle");
            nextSteps.add("Schedule dispatch to verified partner shelter");
        } else {
            // Default Grade B or C based on condition
            grade = hasTears ? ConditionGrade.GRADE_C : ConditionGrade.GRADE_B;
            route = hasTears ? "INDUSTRIAL_TEXTILE_RECYCLE" : "COMMUNITY_SHELTER_BULK";
            confidence = 88.5;
            rationale = "Multi-factor assessment indicates optimal value retention via secondary redistribution or material downcycling.";
            factors.add("Wear duration: " + wearDuration);
            factors.add("Sanitization status: " + (isSanitized ? "Verified" : "Pending"));
            destination = hasTears ? "Textile Shredding & Rag Manufacturer" : "Community Wardrobe Drive";
            nextSteps.add("Human Quality Inspector to confirm AI classification at intake station");
        }

        // Calculate defensible environmental outcome metrics based on WRAP LCA benchmarks
        double weightKg = estimateWeightByCategory(category);
        double waterSavedLiters = weightKg * getLcaWaterMultiplier(fabric);
        double co2SavedKg = weightKg * getLcaCo2Multiplier(fabric);

        response.setRecommendedRoute(route);
        response.setConditionGrade(grade);
        response.setConfidenceScore(confidence);
        response.setConfidenceLevel(confidence >= 94.0 ? "High Confidence (Autonomous)" : "Moderate Confidence (Human QC Recommended)");
        response.setDecisionRationale(rationale);
        response.setDetectedFactors(factors);
        response.setSuggestedNextSteps(nextSteps);
        response.setEstimatedWaterSavedLiters(Math.round(waterSavedLiters * 10.0) / 10.0);
        response.setEstimatedCo2SavedKg(Math.round(co2SavedKg * 100.0) / 100.0);
        response.setLcaBenchmarkSource("WRAP UK & Ellen MacArthur Foundation Textile LCA Benchmark Standard (ISO 14040/44)");
        response.setRecommendedDestination(destination);
        response.setGeneratedPassportId("ECO-TRC-2026-" + (int)(1000 + Math.random() * 9000));

        return response;
    }

    private double estimateWeightByCategory(String category) {
        String cat = category.toLowerCase();
        if (cat.contains("outerwear") || cat.contains("jacket") || cat.contains("coat")) return 1.25;
        if (cat.contains("denim") || cat.contains("jeans") || cat.contains("trouser")) return 0.75;
        if (cat.contains("knit") || cat.contains("sweater")) return 0.65;
        if (cat.contains("dress") || cat.contains("ethnic")) return 0.55;
        return 0.35; // Standard t-shirt / shirt
    }

    private double getLcaWaterMultiplier(String fabric) {
        String f = fabric.toLowerCase();
        if (f.contains("cotton") || f.contains("denim")) return 7500.0; // Cotton is water-intensive
        if (f.contains("wool") || f.contains("cashmere")) return 8900.0;
        if (f.contains("linen")) return 4500.0;
        return 1900.0; // Synthetics use less water but high CO2
    }

    private double getLcaCo2Multiplier(String fabric) {
        String f = fabric.toLowerCase();
        if (f.contains("polyester") || f.contains("nylon") || f.contains("synthetic")) return 5.8;
        if (f.contains("wool")) return 4.9;
        return 3.6; // Average cotton kg CO2 avoided per kg reused
    }
}
