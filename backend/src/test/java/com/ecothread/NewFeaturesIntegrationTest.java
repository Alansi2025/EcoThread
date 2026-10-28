package com.ecothread;

import com.ecothread.dto.*;
import com.ecothread.model.*;
import com.ecothread.repository.*;
import com.ecothread.service.ImpactService;
import com.ecothread.service.PickupService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class NewFeaturesIntegrationTest {

    @Autowired
    private PickupService pickupService;

    @Autowired
    private ImpactService impactService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PickupRequestRepository pickupRequestRepository;

    @Autowired
    private DonationInvoiceRepository donationInvoiceRepository;

    @Test
    @Transactional
    void testPickupRescheduleAndCancel() {
        User donor = userRepository.findByEmail("donor@ecothread.org").orElseThrow();

        // 1. Create a pickup
        PickupCreateRequest req = new PickupCreateRequest();
        req.setScheduledDate(LocalDate.now().plusDays(2));
        req.setTimeSlot("09:00 AM - 12:00 PM");
        req.setBagCount(2);
        req.setClothTypes("Denims, Shirts");
        req.setStreetAddress("12 MG Road");
        req.setCity("Bengaluru");
        req.setState("Karnataka");
        req.setPincode("560001");

        PickupRequest created = pickupService.createPickup(donor, req);
        assertNotNull(created.getId());
        assertEquals(PickupStatus.PENDING, created.getStatus());

        // 2. Reschedule pickup
        LocalDate newDate = LocalDate.now().plusDays(4);
        ReschedulePickupRequest reschedReq = new ReschedulePickupRequest(newDate, "03:00 PM - 06:00 PM", "Donor travelling");
        PickupRequest rescheduled = pickupService.reschedulePickup(created.getId(), donor, reschedReq);
        assertEquals(newDate, rescheduled.getScheduledDate());
        assertEquals("03:00 PM - 06:00 PM", rescheduled.getTimeSlot());

        // 3. Cancel pickup
        CancelPickupRequest cancelReq = new CancelPickupRequest("Item given to local shelter");
        PickupRequest cancelled = pickupService.cancelPickup(created.getId(), donor, cancelReq);
        assertEquals(PickupStatus.CANCELLED, cancelled.getStatus());
        assertTrue(cancelled.getDriverNotes().contains("Cancellation Reason"));
    }

    @Test
    void testDonorPersonalImpactCalculation() {
        User donor = userRepository.findByEmail("donor@ecothread.org").orElseThrow();
        DonorImpactResponse impact = impactService.getDonorImpact(donor);

        assertNotNull(impact);
        assertTrue(impact.getTotalPickupsCompleted() >= 1);
        assertTrue(impact.getWaterSavedLiters() > 0);
        assertTrue(impact.getCo2SavedKg() > 0);
        assertTrue(impact.getLandfillDivertedKg() > 0);
        assertTrue(impact.getTreesEquivalent() > 0);
        assertTrue(impact.getTaxDeductionEligibleAmount() > 0);
    }

    @Test
    void testPlatformSustainabilityReport() {
        SustainabilityReportResponse report = impactService.getSustainabilityReport();

        assertNotNull(report);
        assertTrue(report.getTotalClothesDiverted() > 0);
        assertTrue(report.getCircularityRatePercentage() >= 0);
        assertTrue(report.getSdgAlignments().containsKey("SDG 12"));
        assertTrue(report.getSdgAlignments().containsKey("SDG 1"));
        assertTrue(report.getSdgAlignments().containsKey("SDG 13"));
    }

    @Test
    void testInvoiceVerificationData() {
        DonationInvoice invoice = donationInvoiceRepository.findByInvoiceNumber("ECO-80G-2026-0042")
                .orElseGet(() -> donationInvoiceRepository.findAll().stream().findFirst().orElseThrow());

        assertNotNull(invoice);
        assertEquals("ECO-80G-2026-0042", invoice.getInvoiceNumber());
        assertEquals(14, invoice.getTotalItemsVerified());
        assertEquals(37800.0, invoice.getWaterSavedLiters());
    }
}
