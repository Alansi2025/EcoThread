package com.ecothread.dto;

import java.util.Map;

public class SustainabilityReportResponse {

    private long totalClothesDiverted;
    private double waterSavedLiters;
    private double co2SavedKg;
    private double landfillDivertedKg;
    private long gradeACount;
    private long gradeBCount;
    private long recycleCount;
    private double circularityRatePercentage;
    private long completedPickups;
    private long totalBeneficiaryOrders;
    private long registeredBeneficiariesCount;
    private Map<String, String> sdgAlignments;

    public SustainabilityReportResponse() {}

    public SustainabilityReportResponse(long totalClothesDiverted, double waterSavedLiters,
                                        double co2SavedKg, double landfillDivertedKg,
                                        long gradeACount, long gradeBCount, long recycleCount,
                                        double circularityRatePercentage, long completedPickups,
                                        long totalBeneficiaryOrders, long registeredBeneficiariesCount,
                                        Map<String, String> sdgAlignments) {
        this.totalClothesDiverted = totalClothesDiverted;
        this.waterSavedLiters = waterSavedLiters;
        this.co2SavedKg = co2SavedKg;
        this.landfillDivertedKg = landfillDivertedKg;
        this.gradeACount = gradeACount;
        this.gradeBCount = gradeBCount;
        this.recycleCount = recycleCount;
        this.circularityRatePercentage = circularityRatePercentage;
        this.completedPickups = completedPickups;
        this.totalBeneficiaryOrders = totalBeneficiaryOrders;
        this.registeredBeneficiariesCount = registeredBeneficiariesCount;
        this.sdgAlignments = sdgAlignments;
    }

    public long getTotalClothesDiverted() {
        return totalClothesDiverted;
    }

    public void setTotalClothesDiverted(long totalClothesDiverted) {
        this.totalClothesDiverted = totalClothesDiverted;
    }

    public double getWaterSavedLiters() {
        return waterSavedLiters;
    }

    public void setWaterSavedLiters(double waterSavedLiters) {
        this.waterSavedLiters = waterSavedLiters;
    }

    public double getCo2SavedKg() {
        return co2SavedKg;
    }

    public void setCo2SavedKg(double co2SavedKg) {
        this.co2SavedKg = co2SavedKg;
    }

    public double getLandfillDivertedKg() {
        return landfillDivertedKg;
    }

    public void setLandfillDivertedKg(double landfillDivertedKg) {
        this.landfillDivertedKg = landfillDivertedKg;
    }

    public long getGradeACount() {
        return gradeACount;
    }

    public void setGradeACount(long gradeACount) {
        this.gradeACount = gradeACount;
    }

    public long getGradeBCount() {
        return gradeBCount;
    }

    public void setGradeBCount(long gradeBCount) {
        this.gradeBCount = gradeBCount;
    }

    public long getRecycleCount() {
        return recycleCount;
    }

    public void setRecycleCount(long recycleCount) {
        this.recycleCount = recycleCount;
    }

    public double getCircularityRatePercentage() {
        return circularityRatePercentage;
    }

    public void setCircularityRatePercentage(double circularityRatePercentage) {
        this.circularityRatePercentage = circularityRatePercentage;
    }

    public long getCompletedPickups() {
        return completedPickups;
    }

    public void setCompletedPickups(long completedPickups) {
        this.completedPickups = completedPickups;
    }

    public long getTotalBeneficiaryOrders() {
        return totalBeneficiaryOrders;
    }

    public void setTotalBeneficiaryOrders(long totalBeneficiaryOrders) {
        this.totalBeneficiaryOrders = totalBeneficiaryOrders;
    }

    public long getRegisteredBeneficiariesCount() {
        return registeredBeneficiariesCount;
    }

    public void setRegisteredBeneficiariesCount(long registeredBeneficiariesCount) {
        this.registeredBeneficiariesCount = registeredBeneficiariesCount;
    }

    public Map<String, String> getSdgAlignments() {
        return sdgAlignments;
    }

    public void setSdgAlignments(Map<String, String> sdgAlignments) {
        this.sdgAlignments = sdgAlignments;
    }
}
