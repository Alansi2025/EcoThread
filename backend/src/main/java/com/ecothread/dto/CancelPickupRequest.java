package com.ecothread.dto;

import jakarta.validation.constraints.NotBlank;

public class CancelPickupRequest {

    @NotBlank
    private String reason;

    public CancelPickupRequest() {}

    public CancelPickupRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
