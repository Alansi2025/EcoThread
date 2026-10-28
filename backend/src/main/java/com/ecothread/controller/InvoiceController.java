package com.ecothread.controller;

import com.ecothread.dto.CertificateVerificationResponse;
import com.ecothread.model.DonationInvoice;
import com.ecothread.model.PickupRequest;
import com.ecothread.model.User;
import com.ecothread.repository.DonationInvoiceRepository;
import com.ecothread.repository.PickupRequestRepository;
import com.ecothread.service.PdfInvoiceService;
import com.ecothread.service.PickupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Invoices & 80G Receipts", description = "Endpoints for downloading and verifying official 80G Tax Exemption PDF receipts")
public class InvoiceController {

    private final DonationInvoiceRepository donationInvoiceRepository;
    private final PickupRequestRepository pickupRequestRepository;
    private final PickupService pickupService;
    private final PdfInvoiceService pdfInvoiceService;

    @Value("${ecothread.org.name:EcoThread Sustainable Foundation}")
    private String orgName;

    @Value("${ecothread.org.reg-number:NGO-80G/CSR/2026/88421}")
    private String regNumber;

    @Value("${ecothread.org.tax-exemption-id:AAATE1234F-80G-01}")
    private String taxExemptionId;

    public InvoiceController(DonationInvoiceRepository donationInvoiceRepository,
                             PickupRequestRepository pickupRequestRepository,
                             PickupService pickupService,
                             PdfInvoiceService pdfInvoiceService) {
        this.donationInvoiceRepository = donationInvoiceRepository;
        this.pickupRequestRepository = pickupRequestRepository;
        this.pickupService = pickupService;
        this.pdfInvoiceService = pdfInvoiceService;
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "Generate and stream official 80G Tax Exemption Receipt PDF")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        // Try looking up by invoice ID first, then pickup ID
        DonationInvoice invoice = donationInvoiceRepository.findById(id)
                .or(() -> donationInvoiceRepository.findByPickupRequestId(id))
                .orElseGet(() -> {
                    // Check if pickup exists and create an invoice for it
                    Optional<PickupRequest> pickup = pickupRequestRepository.findById(id);
                    if (pickup.isPresent()) {
                        return pickupService.ensureInvoiceExists(pickup.get(), 10);
                    }
                    throw new IllegalArgumentException("Invoice or completed pickup not found for id: " + id);
                });

        byte[] pdfBytes = pdfInvoiceService.generate80GReceiptPdf(invoice);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "EcoThread_80G_Receipt_" + invoice.getInvoiceNumber() + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @GetMapping("/pickup/{pickupId}")
    @Operation(summary = "Get invoice metadata by pickup request ID")
    public ResponseEntity<?> getInvoiceByPickup(@PathVariable Long pickupId) {
        Optional<DonationInvoice> invoice = donationInvoiceRepository.findByPickupRequestId(pickupId);
        if (invoice.isPresent()) {
            return ResponseEntity.ok(invoice.get());
        }
        // Fallback: check if pickup is completed, generate on the fly
        Optional<PickupRequest> pickup = pickupRequestRepository.findById(pickupId);
        if (pickup.isPresent()) {
            DonationInvoice generated = pickupService.ensureInvoiceExists(pickup.get(), null);
            return ResponseEntity.ok(generated);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/my")
    @Operation(summary = "Get all 80G donation invoices issued to authenticated donor")
    public ResponseEntity<List<DonationInvoice>> getMyInvoices(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(donationInvoiceRepository.findByDonorIdOrderByIssuedAtDesc(currentUser.getId()));
    }

    @GetMapping("/verify/{invoiceNumber}")
    @Operation(summary = "Publicly verify an official Section 80G Tax Exemption Receipt by invoice number")
    public ResponseEntity<CertificateVerificationResponse> verifyInvoice(@PathVariable String invoiceNumber) {
        Optional<DonationInvoice> optionalInvoice = donationInvoiceRepository.findByInvoiceNumber(invoiceNumber.trim());

        if (optionalInvoice.isEmpty()) {
            return ResponseEntity.status(404).body(
                    CertificateVerificationResponse.invalid(invoiceNumber, "Certificate not found in official registry. Please check the reference number.")
            );
        }

        DonationInvoice invoice = optionalInvoice.get();

        // Privacy-mask donor name: e.g. "Aarav Sharma" -> "A**** S*****"
        String maskedName = maskName(invoice.getDonor() != null ? invoice.getDonor().getFullName() : "Donor");

        // Generate deterministic cryptographic signature seal token
        String sealToken = generateSealToken(invoice.getInvoiceNumber(), regNumber, invoice.getTotalItemsVerified());

        CertificateVerificationResponse response = CertificateVerificationResponse.valid(
                invoice.getInvoiceNumber(),
                orgName,
                regNumber,
                taxExemptionId,
                maskedName,
                invoice.getTotalItemsVerified(),
                invoice.getWaterSavedLiters(),
                invoice.getCo2SavedKg(),
                invoice.getIssuedAt(),
                sealToken
        );

        return ResponseEntity.ok(response);
    }

    private String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "Anonymous Donor";
        String[] parts = fullName.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (part.length() <= 1) {
                sb.append(part).append(" ");
            } else {
                sb.append(part.charAt(0))
                  .append("*".repeat(part.length() - 1))
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }

    private String generateSealToken(String invNum, String regNum, int count) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String raw = invNum + ":" + regNum + ":" + count + ":verified-ecothread";
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return "ECO-SEAL-" + HexFormat.of().formatHex(hash).substring(0, 16).toUpperCase();
        } catch (Exception e) {
            return "ECO-SEAL-VERIFIED";
        }
    }
}
