package com.ecothread.dto;

import com.ecothread.model.PickupStatus;
import jakarta.validation.constraints.NotNull;

public class PickupStatusUpdateRequest {

    @NotNull
    private PickupStatus status;

    private Long driverId;
    private String driverNotes;
    private Double estimatedWeightKg;
    private Integer verifiedItemCount;

    public PickupStatusUpdateRequest() {}

    public PickupStatus getStatus() {
        return status;
    }

    public void setStatus(PickupStatus status) {
        this.status = status;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public String getDriverNotes() {
        return driverNotes;
    }

    public void setDriverNotes(String driverNotes) {
        this.driverNotes = driverNotes;
    }

    public Double getEstimatedWeightKg() {
        return estimatedWeightKg;
    }

    public void setEstimatedWeightKg(Double estimatedWeightKg) {
        this.estimatedWeightKg = estimatedWeightKg;
    }

    public Integer getVerifiedItemCount() {
        return verifiedItemCount;
    }

    public void setVerifiedItemCount(Integer verifiedItemCount) {
        this.verifiedItemCount = verifiedItemCount;
    }
}
