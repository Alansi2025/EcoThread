package com.ecothread.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_invoices")
public class DonationInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pickup_request_id", nullable = false, unique = true)
    private PickupRequest pickupRequest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donor_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "hibernateLazyInitializer", "handler"})
    private User donor;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @Column(nullable = false)
    private Integer totalItemsVerified = 0;

    @Column(nullable = false)
    private Double co2SavedKg = 0.0;

    @Column(nullable = false)
    private Double waterSavedLiters = 0.0;

    private String pdfFileUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    public DonationInvoice() {}

    public DonationInvoice(PickupRequest pickupRequest, User donor, String invoiceNumber,
                           Integer totalItemsVerified, Double co2SavedKg, Double waterSavedLiters) {
        this.pickupRequest = pickupRequest;
        this.donor = donor;
        this.invoiceNumber = invoiceNumber;
        this.totalItemsVerified = totalItemsVerified != null ? totalItemsVerified : 0;
        this.co2SavedKg = co2SavedKg != null ? co2SavedKg : 0.0;
        this.waterSavedLiters = waterSavedLiters != null ? waterSavedLiters : 0.0;
        this.issuedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PickupRequest getPickupRequest() {
        return pickupRequest;
    }

    public void setPickupRequest(PickupRequest pickupRequest) {
        this.pickupRequest = pickupRequest;
    }

    public User getDonor() {
        return donor;
    }

    public void setDonor(User donor) {
        this.donor = donor;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Integer getTotalItemsVerified() {
        return totalItemsVerified;
    }

    public void setTotalItemsVerified(Integer totalItemsVerified) {
        this.totalItemsVerified = totalItemsVerified;
    }

    public Double getCo2SavedKg() {
        return co2SavedKg;
    }

    public void setCo2SavedKg(Double co2SavedKg) {
        this.co2SavedKg = co2SavedKg;
    }

    public Double getWaterSavedLiters() {
        return waterSavedLiters;
    }

    public void setWaterSavedLiters(Double waterSavedLiters) {
        this.waterSavedLiters = waterSavedLiters;
    }

    public String getPdfFileUrl() {
        return pdfFileUrl;
    }

    public void setPdfFileUrl(String pdfFileUrl) {
        this.pdfFileUrl = pdfFileUrl;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }
}
