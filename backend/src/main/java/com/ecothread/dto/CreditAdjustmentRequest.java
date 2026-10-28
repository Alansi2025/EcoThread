package com.ecothread.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreditAdjustmentRequest {

    @NotNull
    @Min(1)
    private Integer amount;

    @NotBlank
    private String reason; // e.g., "Seasonal Winter Relief Allowance", "Disaster Relief Top-up"

    @NotBlank
    private String operation = "GRANT"; // "GRANT" or "DEDUCT"

    public CreditAdjustmentRequest() {}

    public CreditAdjustmentRequest(Integer amount, String reason, String operation) {
        this.amount = amount;
        this.reason = reason;
        this.operation = operation != null ? operation : "GRANT";
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getOperation() {
        return operation;
    }

    public void setOperation(String operation) {
        this.operation = operation;
    }
}
