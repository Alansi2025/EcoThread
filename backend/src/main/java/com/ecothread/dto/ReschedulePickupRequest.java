package com.ecothread.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ReschedulePickupRequest {

    @NotNull
    @FutureOrPresent
    private LocalDate newScheduledDate;

    @NotBlank
    private String newTimeSlot;

    private String notes;

    public ReschedulePickupRequest() {}

    public ReschedulePickupRequest(LocalDate newScheduledDate, String newTimeSlot, String notes) {
        this.newScheduledDate = newScheduledDate;
        this.newTimeSlot = newTimeSlot;
        this.notes = notes;
    }

    public LocalDate getNewScheduledDate() {
        return newScheduledDate;
    }

    public void setNewScheduledDate(LocalDate newScheduledDate) {
        this.newScheduledDate = newScheduledDate;
    }

    public String getNewTimeSlot() {
        return newTimeSlot;
    }

    public void setNewTimeSlot(String newTimeSlot) {
        this.newTimeSlot = newTimeSlot;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
