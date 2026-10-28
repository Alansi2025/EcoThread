package com.ecothread.dto;

import java.time.LocalDateTime;

public class BeneficiarySummaryDto {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Integer credits;
    private long totalOrdersPlaced;
    private LocalDateTime registeredAt;

    public BeneficiarySummaryDto() {}

    public BeneficiarySummaryDto(Long id, String fullName, String email, String phone,
                                 Integer credits, long totalOrdersPlaced, LocalDateTime registeredAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.credits = credits;
        this.totalOrdersPlaced = totalOrdersPlaced;
        this.registeredAt = registeredAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public long getTotalOrdersPlaced() {
        return totalOrdersPlaced;
    }

    public void setTotalOrdersPlaced(long totalOrdersPlaced) {
        this.totalOrdersPlaced = totalOrdersPlaced;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }
}
