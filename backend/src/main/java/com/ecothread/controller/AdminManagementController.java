package com.ecothread.controller;

import com.ecothread.dto.BeneficiarySummaryDto;
import com.ecothread.dto.CreditAdjustmentRequest;
import com.ecothread.dto.SustainabilityReportResponse;
import com.ecothread.model.Role;
import com.ecothread.model.User;
import com.ecothread.repository.BeneficiaryOrderRepository;
import com.ecothread.repository.UserRepository;
import com.ecothread.service.ImpactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Operations & ESG Reporting", description = "Workstation for beneficiary monthly credit quotas and sustainability audit reports")
public class AdminManagementController {

    private final UserRepository userRepository;
    private final BeneficiaryOrderRepository orderRepository;
    private final ImpactService impactService;

    public AdminManagementController(UserRepository userRepository,
                                     BeneficiaryOrderRepository orderRepository,
                                     ImpactService impactService) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.impactService = impactService;
    }

    @GetMapping("/beneficiaries")
    @Operation(summary = "List all registered beneficiaries with current allowance quotas and order statistics")
    public ResponseEntity<List<BeneficiarySummaryDto>> getAllBeneficiaries() {
        List<User> beneficiaries = userRepository.findByRole(Role.ROLE_BENEFICIARY);
        List<BeneficiarySummaryDto> result = new ArrayList<>();

        for (User b : beneficiaries) {
            long orderCount = orderRepository.findByBeneficiaryIdOrderByCreatedAtDesc(b.getId()).size();
            result.add(new BeneficiarySummaryDto(
                    b.getId(),
                    b.getFullName(),
                    b.getEmail(),
                    b.getPhone(),
                    b.getCredits(),
                    orderCount,
                    b.getCreatedAt()
            ));
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/beneficiaries/{id}/credits")
    @Transactional
    @Operation(summary = "Allocate or adjust monthly seasonal NGO credits for a beneficiary")
    public ResponseEntity<User> adjustBeneficiaryCredits(
            @PathVariable Long id,
            @Valid @RequestBody CreditAdjustmentRequest request) {
        User beneficiary = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Beneficiary not found: " + id));

        if (beneficiary.getRole() != Role.ROLE_BENEFICIARY) {
            throw new IllegalArgumentException("Target user is not registered as a Beneficiary");
        }

        int currentCredits = beneficiary.getCredits() != null ? beneficiary.getCredits() : 0;
        int delta = request.getAmount();

        if ("DEDUCT".equalsIgnoreCase(request.getOperation())) {
            beneficiary.setCredits(Math.max(0, currentCredits - delta));
        } else {
            beneficiary.setCredits(currentCredits + delta);
        }

        User saved = userRepository.save(beneficiary);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/reports/sustainability")
    @Operation(summary = "Get platform ESG Circularity and UN SDG sustainability audit report")
    public ResponseEntity<SustainabilityReportResponse> getSustainabilityReport() {
        return ResponseEntity.ok(impactService.getSustainabilityReport());
    }

    @GetMapping("/reports/sustainability/csv")
    @Operation(summary = "Download Platform ESG Sustainability Audit Report as CSV")
    public ResponseEntity<byte[]> downloadSustainabilityCsv() {
        SustainabilityReportResponse report = impactService.getSustainabilityReport();

        StringBuilder csv = new StringBuilder();
        csv.append("Metric,Value,Unit/Details\n");
        csv.append("Total Clothes Diverted,").append(report.getTotalClothesDiverted()).append(",Items diverted from landfill\n");
        csv.append("Water Conserved,").append(report.getWaterSavedLiters()).append(",Liters fresh water\n");
        csv.append("Greenhouse Gas Avoided,").append(report.getCo2SavedKg()).append(",Kg CO2 equivalent\n");
        csv.append("Solid Textile Landfill Diverted,").append(report.getLandfillDivertedKg()).append(",Kg solid waste\n");
        csv.append("Grade A (Store Catalog),").append(report.getGradeACount()).append(",Pristine sanitized garments\n");
        csv.append("Grade B (Bulk Aid Drives),").append(report.getGradeBCount()).append(",Community disaster relief\n");
        csv.append("Recycle Downcycling,").append(report.getRecycleCount()).append(",Fiber shredding and spinning\n");
        csv.append("Platform Circularity Rate,").append(report.getCircularityRatePercentage()).append(",Percent circular reuse\n");
        csv.append("Completed Doorstep Pickups,").append(report.getCompletedPickups()).append(",Verified donor collections\n");
        csv.append("Beneficiary Orders Fulfilled,").append(report.getTotalBeneficiaryOrders()).append(",Free allowance shipments\n");
        csv.append("Supported Beneficiaries,").append(report.getRegisteredBeneficiariesCount()).append(",Families receiving aid\n");

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "EcoThread_ESG_Sustainability_Report.csv");

        return ResponseEntity.ok().headers(headers).body(bytes);
    }
}
