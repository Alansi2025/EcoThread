package com.ecothread.dto;

import java.time.LocalDateTime;

public class CertificateVerificationResponse {

    private boolean isValid;
    private String invoiceNumber;
    private String organizationName;
    private String organizationRegNumber;
    private String taxExemptionId;
    private String maskedDonorName;
    private int totalItemsVerified;
    private double waterSavedLiters;
    private double co2SavedKg;
    private LocalDateTime issuedAt;
    private String verificationStatusMessage;
    private String digitalSealToken;

    public CertificateVerificationResponse() {}

    public static CertificateVerificationResponse invalid(String invoiceNumber, String message) {
        CertificateVerificationResponse response = new CertificateVerificationResponse();
        response.setValid(false);
        response.setInvoiceNumber(invoiceNumber);
        response.setVerificationStatusMessage(message);
        return response;
    }

    public static CertificateVerificationResponse valid(String invoiceNumber,
                                                        String organizationName,
                                                        String organizationRegNumber,
                                                        String taxExemptionId,
                                                        String maskedDonorName,
                                                        int totalItemsVerified,
                                                        double waterSavedLiters,
                                                        double co2SavedKg,
                                                        LocalDateTime issuedAt,
                                                        String digitalSealToken) {
        CertificateVerificationResponse response = new CertificateVerificationResponse();
        response.setValid(true);
        response.setInvoiceNumber(invoiceNumber);
        response.setOrganizationName(organizationName);
        response.setOrganizationRegNumber(organizationRegNumber);
        response.setTaxExemptionId(taxExemptionId);
        response.setMaskedDonorName(maskedDonorName);
        response.setTotalItemsVerified(totalItemsVerified);
        response.setWaterSavedLiters(waterSavedLiters);
        response.setCo2SavedKg(co2SavedKg);
        response.setIssuedAt(issuedAt);
        response.setDigitalSealToken(digitalSealToken);
        response.setVerificationStatusMessage("Valid Section 80G Tax Exemption Certificate issued by " + organizationName);
        return response;
    }

    public boolean isValid() {
        return isValid;
    }

    public void setValid(boolean valid) {
        isValid = valid;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getOrganizationRegNumber() {
        return organizationRegNumber;
    }

    public void setOrganizationRegNumber(String organizationRegNumber) {
        this.organizationRegNumber = organizationRegNumber;
    }

    public String getTaxExemptionId() {
        return taxExemptionId;
    }

    public void setTaxExemptionId(String taxExemptionId) {
        this.taxExemptionId = taxExemptionId;
    }

    public String getMaskedDonorName() {
        return maskedDonorName;
    }

    public void setMaskedDonorName(String maskedDonorName) {
        this.maskedDonorName = maskedDonorName;
    }

    public int getTotalItemsVerified() {
        return totalItemsVerified;
    }

    public void setTotalItemsVerified(int totalItemsVerified) {
        this.totalItemsVerified = totalItemsVerified;
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

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public String getVerificationStatusMessage() {
        return verificationStatusMessage;
    }

    public void setVerificationStatusMessage(String verificationStatusMessage) {
        this.verificationStatusMessage = verificationStatusMessage;
    }

    public String getDigitalSealToken() {
        return digitalSealToken;
    }

    public void setDigitalSealToken(String digitalSealToken) {
        this.digitalSealToken = digitalSealToken;
    }
}
