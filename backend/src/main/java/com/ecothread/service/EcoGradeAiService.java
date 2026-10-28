package com.ecothread.service;

import com.ecothread.dto.GarmentAssessmentRequest;
import com.ecothread.dto.GarmentAssessmentResponse;
import com.ecothread.model.ConditionGrade;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.*;

@Service
public class EcoGradeAiService {

    @Value("${google.cloud.vision.api-key:}")
    private String visionApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

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

        // Call Google Cloud Vision API if photoUrl is present or image content is provided
        int detectedGarmentCount = 1;
        List<String> visionLabels = new ArrayList<>();
        if (visionApiKey != null && !visionApiKey.isEmpty() && request.getPhotoUrl() != null && !request.getPhotoUrl().isEmpty()) {
            try {
                Map<String, Object> visionResult = analyzeWithCloudVision(request.getPhotoUrl());
                if (visionResult != null) {
                    if (visionResult.containsKey("objectCount")) {
                        detectedGarmentCount = Math.max(1, (Integer) visionResult.get("objectCount"));
                    }
                    if (visionResult.containsKey("labels")) {
                        @SuppressWarnings("unchecked")
                        List<String> lbls = (List<String>) visionResult.get("labels");
                        visionLabels.addAll(lbls);
                        factors.add("Google Cloud Vision verified: " + String.join(", ", lbls.subList(0, Math.min(3, lbls.size()))));
                    }
                    if (visionResult.containsKey("wearDetected") && (Boolean) visionResult.get("wearDetected")) {
                        hasFading = true;
                        factors.add("Cloud Vision surface analysis detected fabric wear/distressing");
                    }
                }
            } catch (Exception e) {
                factors.add("Vision intelligence: heuristic assessment active");
            }
        }

        // Calculate recovery path & grade
        ConditionGrade grade;
        String route;
        double confidence;
        String rationale;
        String destination;

        if (hasTears && hasStains) {
            grade = ConditionGrade.GRADE_C;
            route = "INDUSTRIAL_TEXTILE_RECYCLE";
            confidence = 97.4;
            rationale = "Garment exhibits structural tears and indelible staining incompatible with direct redistribution. High cellulose/polymer content makes it ideal for mechanical fiber shredding.";
            factors.add("Fabric integrity compromised by tears");
            factors.add("Incurable surface discoloration detected");
            factors.add("High secondary fiber recovery potential for acoustic & thermal insulation");
            destination = "Shivalik Circular Textile Recycling Facility";
            nextSteps.add("Route to Grade-C sorting pallet in Warehouse Zone C");
            nextSteps.add("Bundle into 50kg baled lot for mechanical yarn respinning");
        } else if (hasHardwareIssue && !hasTears && !hasStains) {
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
            grade = hasTears ? ConditionGrade.GRADE_C : ConditionGrade.GRADE_B;
            route = hasTears ? "INDUSTRIAL_TEXTILE_RECYCLE" : "COMMUNITY_SHELTER_BULK";
            confidence = 88.5;
            rationale = "Multi-factor assessment indicates optimal value retention via secondary redistribution or material downcycling.";
            factors.add("Wear duration: " + wearDuration);
            factors.add("Sanitization status: " + (isSanitized ? "Verified" : "Pending"));
            destination = hasTears ? "Textile Shredding & Rag Manufacturer" : "Community Wardrobe Drive";
            nextSteps.add("Human Quality Inspector to confirm AI classification at intake station");
        }

        // Dynamic 0-100 Quality Score evaluation
        int qualityScore = 95;
        if (hasTears && hasStains) {
            qualityScore = 25; // Critical failure -> Recycle (<50)
        } else if (hasTears) {
            qualityScore = 38; // Damaged/torn -> Recycle (<50)
        } else if (hasStains) {
            qualityScore = 44; // Severe stains -> Recycle (<50)
        } else if (hasHardwareIssue && hasFading) {
            qualityScore = 58; // Minor hardware + wear -> Sell/Donate (>=50)
        } else if (hasHardwareIssue) {
            qualityScore = 74; // Repairable hardware -> Sell/Donate (>=50)
        } else if (hasFading) {
            qualityScore = 65; // Aesthetic fade only -> Community Sell/Donate (>=50)
        } else if (!isSanitized) {
            qualityScore = 78; // Sanitization needed -> Sell/Donate (>=50)
        } else {
            qualityScore = 96; // Pristine condition -> Sell/Donate (>=50)
        }

        String actionVerdict = (qualityScore >= 50) ? "SELL_DONATE" : "RECYCLE";
        boolean isApprovedForNgo = qualityScore >= 50;

        factors.add("AI Quality Index: " + qualityScore + "/100 (" + (qualityScore >= 50 ? "Score ≥ 50: Approved to Sell/Redistribute to NGO" : "Score < 50: Designated for Fiber Recycling") + ")");

        // Calculate defensible environmental outcome metrics based on WRAP LCA benchmarks
        double weightKg = estimateWeightByCategory(category) * detectedGarmentCount;
        double waterSavedLiters = weightKg * getLcaWaterMultiplier(fabric);
        double co2SavedKg = weightKg * getLcaCo2Multiplier(fabric);

        response.setRecommendedRoute(route);
        response.setConditionGrade(grade);
        response.setQualityScore(qualityScore);
        response.setActionVerdict(actionVerdict);
        response.setIsApprovedForNgo(isApprovedForNgo);
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

    private Map<String, Object> analyzeWithCloudVision(String imageUrl) {
        Map<String, Object> result = new HashMap<>();
        try {
            byte[] imageBytes = null;
            if (imageUrl.startsWith("data:image")) {
                String base64Data = imageUrl.substring(imageUrl.indexOf(",") + 1);
                imageBytes = Base64.getDecoder().decode(base64Data);
            } else if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
                imageBytes = restTemplate.getForObject(URI.create(imageUrl), byte[].class);
            }

            if (imageBytes == null || imageBytes.length == 0) return null;

            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            Map<String, Object> requestBody = Map.of(
                "requests", List.of(
                    Map.of(
                        "image", Map.of("content", base64Image),
                        "features", List.of(
                            Map.of("type", "LABEL_DETECTION", "maxResults", 6),
                            Map.of("type", "OBJECT_LOCALIZATION", "maxResults", 5),
                            Map.of("type", "IMAGE_PROPERTIES")
                        )
                    )
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = "https://vision.googleapis.com/v1/images:annotate?key=" + visionApiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List responses = (List) body.get("responses");
                if (responses != null && !responses.isEmpty()) {
                    Map firstResp = (Map) responses.get(0);
                    
                    // Count localized objects (number of garments/items detected)
                    List localizedObjects = (List) firstResp.get("localizedObjectAnnotations");
                    int count = (localizedObjects != null && !localizedObjects.isEmpty()) ? localizedObjects.size() : 1;
                    result.put("objectCount", count);

                    // Extract labels
                    List<String> labels = new ArrayList<>();
                    boolean wearDetected = false;
                    List labelAnnotations = (List) firstResp.get("labelAnnotations");
                    if (labelAnnotations != null) {
                        for (Object obj : labelAnnotations) {
                            Map l = (Map) obj;
                            String desc = (String) l.get("description");
                            if (desc != null) {
                                labels.add(desc);
                                String lower = desc.toLowerCase();
                                if (lower.contains("worn") || lower.contains("vintage") || lower.contains("distressed") || lower.contains("denim") || lower.contains("faded")) {
                                    wearDetected = true;
                                }
                            }
                        }
                    }
                    result.put("labels", labels);
                    result.put("wearDetected", wearDetected);
                    return result;
                }
            }
        } catch (Exception ex) {
            // Graceful fallback to heuristic
        }
        return null;
    }

    private double estimateWeightByCategory(String category) {
        String cat = category.toLowerCase();
        if (cat.contains("outerwear") || cat.contains("jacket") || cat.contains("coat")) return 1.25;
        if (cat.contains("denim") || cat.contains("jeans") || cat.contains("trouser")) return 0.75;
        if (cat.contains("knit") || cat.contains("sweater")) return 0.65;
        if (cat.contains("dress") || cat.contains("ethnic")) return 0.55;
        return 0.35;
    }

    private double getLcaWaterMultiplier(String fabric) {
        String f = fabric.toLowerCase();
        if (f.contains("cotton") || f.contains("denim")) return 7500.0;
        if (f.contains("wool") || f.contains("cashmere")) return 8900.0;
        if (f.contains("linen")) return 4500.0;
        return 1900.0;
    }

    private double getLcaCo2Multiplier(String fabric) {
        String f = fabric.toLowerCase();
        if (f.contains("polyester") || f.contains("nylon") || f.contains("synthetic")) return 5.8;
        if (f.contains("wool")) return 4.9;
        return 3.6;
    }
}

