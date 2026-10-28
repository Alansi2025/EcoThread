package com.ecothread.dto;

import java.util.List;
import java.util.Map;

public class CampusStatsResponse {

    private String campusName;
    private String activeDriveName;
    private Double totalWeightCollectedKg;
    private Integer totalGarmentsDiverted;
    private Double totalWaterSavedLiters;
    private Double totalCo2SavedKg;
    private Double overallCircularityRate; // e.g., 98.5%

    // Outcome Split
    private Long reusedStoreCount;
    private Long communityBulkCount;
    private Long fiberRecycledCount;
    private Long awaitingSortingCount;

    private List<HostelLeaderboardEntry> hostelLeaderboard;
    private List<RecentPassportsDto> recentPassports;
    private String methodologyNote;

    public CampusStatsResponse() {}

    public static class HostelLeaderboardEntry {
        private String hostelName;
        private Double weightKg;
        private Integer garmentsCollected;
        private Double circularityPercent;
        private Integer ecoScore;

        public HostelLeaderboardEntry() {}

        public HostelLeaderboardEntry(String hostelName, Double weightKg, Integer garmentsCollected, Double circularityPercent, Integer ecoScore) {
            this.hostelName = hostelName;
            this.weightKg = weightKg;
            this.garmentsCollected = garmentsCollected;
            this.circularityPercent = circularityPercent;
            this.ecoScore = ecoScore;
        }

        public String getHostelName() { return hostelName; }
        public void setHostelName(String hostelName) { this.hostelName = hostelName; }

        public Double getWeightKg() { return weightKg; }
        public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

        public Integer getGarmentsCollected() { return garmentsCollected; }
        public void setGarmentsCollected(Integer garmentsCollected) { this.garmentsCollected = garmentsCollected; }

        public Double getCircularityPercent() { return circularityPercent; }
        public void setCircularityPercent(Double circularityPercent) { this.circularityPercent = circularityPercent; }

        public Integer getEcoScore() { return ecoScore; }
        public void setEcoScore(Integer ecoScore) { this.ecoScore = ecoScore; }
    }

    public static class RecentPassportsDto {
        private String passportId;
        private String title;
        private String category;
        private Double weightKg;
        private String sourceCampus;
        private String currentStage;
        private String finalOutcome;

        public RecentPassportsDto() {}

        public RecentPassportsDto(String passportId, String title, String category, Double weightKg,
                                  String sourceCampus, String currentStage, String finalOutcome) {
            this.passportId = passportId;
            this.title = title;
            this.category = category;
            this.weightKg = weightKg;
            this.sourceCampus = sourceCampus;
            this.currentStage = currentStage;
            this.finalOutcome = finalOutcome;
        }

        public String getPassportId() { return passportId; }
        public void setPassportId(String passportId) { this.passportId = passportId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public Double getWeightKg() { return weightKg; }
        public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

        public String getSourceCampus() { return sourceCampus; }
        public void setSourceCampus(String sourceCampus) { this.sourceCampus = sourceCampus; }

        public String getCurrentStage() { return currentStage; }
        public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }

        public String getFinalOutcome() { return finalOutcome; }
        public void setFinalOutcome(String finalOutcome) { this.finalOutcome = finalOutcome; }
    }

    public String getCampusName() { return campusName; }
    public void setCampusName(String campusName) { this.campusName = campusName; }

    public String getActiveDriveName() { return activeDriveName; }
    public void setActiveDriveName(String activeDriveName) { this.activeDriveName = activeDriveName; }

    public Double getTotalWeightCollectedKg() { return totalWeightCollectedKg; }
    public void setTotalWeightCollectedKg(Double totalWeightCollectedKg) { this.totalWeightCollectedKg = totalWeightCollectedKg; }

    public Integer getTotalGarmentsDiverted() { return totalGarmentsDiverted; }
    public void setTotalGarmentsDiverted(Integer totalGarmentsDiverted) { this.totalGarmentsDiverted = totalGarmentsDiverted; }

    public Double getTotalWaterSavedLiters() { return totalWaterSavedLiters; }
    public void setTotalWaterSavedLiters(Double totalWaterSavedLiters) { this.totalWaterSavedLiters = totalWaterSavedLiters; }

    public Double getTotalCo2SavedKg() { return totalCo2SavedKg; }
    public void setTotalCo2SavedKg(Double totalCo2SavedKg) { this.totalCo2SavedKg = totalCo2SavedKg; }

    public Double getOverallCircularityRate() { return overallCircularityRate; }
    public void setOverallCircularityRate(Double overallCircularityRate) { this.overallCircularityRate = overallCircularityRate; }

    public Long getReusedStoreCount() { return reusedStoreCount; }
    public void setReusedStoreCount(Long reusedStoreCount) { this.reusedStoreCount = reusedStoreCount; }

    public Long getCommunityBulkCount() { return communityBulkCount; }
    public void setCommunityBulkCount(Long communityBulkCount) { this.communityBulkCount = communityBulkCount; }

    public Long getFiberRecycledCount() { return fiberRecycledCount; }
    public void setFiberRecycledCount(Long fiberRecycledCount) { this.fiberRecycledCount = fiberRecycledCount; }

    public Long getAwaitingSortingCount() { return awaitingSortingCount; }
    public void setAwaitingSortingCount(Long awaitingSortingCount) { this.awaitingSortingCount = awaitingSortingCount; }

    public List<HostelLeaderboardEntry> getHostelLeaderboard() { return hostelLeaderboard; }
    public void setHostelLeaderboard(List<HostelLeaderboardEntry> hostelLeaderboard) { this.hostelLeaderboard = hostelLeaderboard; }

    public List<RecentPassportsDto> getRecentPassports() { return recentPassports; }
    public void setRecentPassports(List<RecentPassportsDto> recentPassports) { this.recentPassports = recentPassports; }

    public String getMethodologyNote() { return methodologyNote; }
    public void setMethodologyNote(String methodologyNote) { this.methodologyNote = methodologyNote; }
}
