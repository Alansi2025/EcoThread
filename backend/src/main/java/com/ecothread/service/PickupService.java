package com.ecothread.service;

import com.ecothread.dto.PickupCreateRequest;
import com.ecothread.dto.PickupStatusUpdateRequest;
import com.ecothread.model.*;
import com.ecothread.repository.AddressRepository;
import com.ecothread.repository.DonationInvoiceRepository;
import com.ecothread.repository.PickupRequestRepository;
import com.ecothread.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PickupService {

    private final PickupRequestRepository pickupRequestRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final DonationInvoiceRepository donationInvoiceRepository;

    public PickupService(PickupRequestRepository pickupRequestRepository,
                         AddressRepository addressRepository,
                         UserRepository userRepository,
                         DonationInvoiceRepository donationInvoiceRepository) {
        this.pickupRequestRepository = pickupRequestRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.donationInvoiceRepository = donationInvoiceRepository;
    }

    @Transactional
    public PickupRequest createPickup(User donor, PickupCreateRequest request) {
        Address address = new Address(
                donor,
                request.getStreetAddress(),
                request.getCity(),
                request.getState(),
                request.getPincode(),
                12.9716, // Default demo geo coordinates (e.g., Bengaluru)
                77.5946
        );
        addressRepository.save(address);

        PickupRequest pickup = new PickupRequest(
                donor,
                address,
                request.getScheduledDate(),
                request.getTimeSlot(),
                request.getBagCount(),
                request.getClothTypes()
        );
        pickup.setEstimatedWeightKg(request.getEstimatedWeightKg() != null ? request.getEstimatedWeightKg() : request.getBagCount() * 5.0);
        return pickupRequestRepository.save(pickup);
    }

    public List<PickupRequest> getPickupsForDonor(Long donorId) {
        return pickupRequestRepository.findByDonorIdOrderByCreatedAtDesc(donorId);
    }

    public List<PickupRequest> getAllPickups() {
        return pickupRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<PickupRequest> getPickupsForDriver(Long driverId) {
        return pickupRequestRepository.findByDriverIdOrderByScheduledDateAsc(driverId);
    }

    public PickupRequest getPickupById(Long id) {
        return pickupRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pickup request not found: " + id));
    }

    @Transactional
    public PickupRequest updatePickupStatus(Long id, PickupStatusUpdateRequest request) {
        PickupRequest pickup = getPickupById(id);
        pickup.setStatus(request.getStatus());

        if (request.getDriverId() != null) {
            userRepository.findById(request.getDriverId()).ifPresent(pickup::setDriver);
        }
        if (request.getDriverNotes() != null) {
            pickup.setDriverNotes(request.getDriverNotes());
        }
        if (request.getEstimatedWeightKg() != null) {
            pickup.setEstimatedWeightKg(request.getEstimatedWeightKg());
        }

        PickupRequest saved = pickupRequestRepository.save(pickup);

        // When pickup is completed, generate or update the 80G tax invoice
        if (request.getStatus() == PickupStatus.COMPLETED) {
            ensureInvoiceExists(saved, request.getVerifiedItemCount());
        }

        return saved;
    }

    @Transactional
    public PickupRequest cancelPickup(Long id, User currentUser, com.ecothread.dto.CancelPickupRequest request) {
        PickupRequest pickup = getPickupById(id);

        // Security check: Only the donor or Admin/Logistics can cancel
        if (currentUser != null && currentUser.getRole() == Role.ROLE_DONOR &&
                !pickup.getDonor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You can only cancel your own pickup requests");
        }

        if (pickup.getStatus() == PickupStatus.PICKED_UP ||
                pickup.getStatus() == PickupStatus.DELIVERED_TO_HUB ||
                pickup.getStatus() == PickupStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel pickup that is already " + pickup.getStatus());
        }

        pickup.setStatus(PickupStatus.CANCELLED);
        String reason = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason()
                : "Cancelled by donor";
        pickup.setDriverNotes("Cancellation Reason: " + reason);
        return pickupRequestRepository.save(pickup);
    }

    @Transactional
    public PickupRequest reschedulePickup(Long id, User currentUser, com.ecothread.dto.ReschedulePickupRequest request) {
        PickupRequest pickup = getPickupById(id);

        if (currentUser != null && currentUser.getRole() == Role.ROLE_DONOR &&
                !pickup.getDonor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You can only reschedule your own pickup requests");
        }

        if (pickup.getStatus() == PickupStatus.PICKED_UP ||
                pickup.getStatus() == PickupStatus.DELIVERED_TO_HUB ||
                pickup.getStatus() == PickupStatus.COMPLETED ||
                pickup.getStatus() == PickupStatus.CANCELLED) {
            throw new IllegalStateException("Cannot reschedule pickup with status " + pickup.getStatus());
        }

        pickup.setScheduledDate(request.getNewScheduledDate());
        pickup.setTimeSlot(request.getNewTimeSlot());
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            pickup.setDriverNotes("Rescheduled: " + request.getNotes());
        }
        return pickupRequestRepository.save(pickup);
    }

    @Transactional
    public DonationInvoice ensureInvoiceExists(PickupRequest pickup, Integer verifiedCount) {
        return donationInvoiceRepository.findByPickupRequestId(pickup.getId())
                .orElseGet(() -> {
                    int count = (verifiedCount != null && verifiedCount > 0)
                            ? verifiedCount
                            : (pickup.getBagCount() != null ? pickup.getBagCount() * 8 : 10);
                    double waterSaved = count * 2700.0; // 2,700 Liters saved per garment reused
                    double co2Saved = count * 3.6;      // 3.6 kg CO2 prevented per garment reused
                    String invoiceNum = "ECO-80G-" + java.time.Year.now().getValue() + "-" +
                            String.format("%04d", (pickup.getId() * 37) % 9999 + 1);

                    DonationInvoice invoice = new DonationInvoice(pickup, pickup.getDonor(), invoiceNum, count, co2Saved, waterSaved);
                    invoice.setPdfFileUrl("/api/invoices/download/" + pickup.getId());
                    return donationInvoiceRepository.save(invoice);
                });
    }
}
