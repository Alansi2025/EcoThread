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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
                12.9716,
                77.5946
        );
        addressRepository.save(address);

        String clothTypes = request.getClothTypes();
        if ((clothTypes == null || clothTypes.isBlank()) && request.getTitle() != null) {
            clothTypes = request.getTitle();
        }

        PickupRequest pickup = new PickupRequest(
                donor,
                address,
                request.getScheduledDate(),
                request.getTimeSlot(),
                request.getBagCount() != null ? request.getBagCount() : 1,
                clothTypes
        );

        pickup.setTitle(request.getTitle() != null ? request.getTitle() : "Donated Clothing Lot");
        pickup.setCategory(request.getCategory() != null ? request.getCategory() : "Apparel");
        pickup.setQuantity(request.getQuantity() != null ? request.getQuantity() : (request.getBagCount() != null ? request.getBagCount() * 5 : 5));
        pickup.setUnit(request.getUnit() != null ? request.getUnit() : "items");
        pickup.setConditionDescription(request.getConditionDescription() != null ? request.getConditionDescription() : "Good condition reusable clothing");
        pickup.setImageUrl(request.getImageUrl());
        pickup.setQualityScore(request.getQualityScore());
        pickup.setPickupOrDropoff(request.getPickupOrDropoff() != null ? request.getPickupOrDropoff() : "PICKUP");
        pickup.setAdditionalInstructions(request.getAdditionalInstructions());
        pickup.setStatus(PickupStatus.SUBMITTED);

        double estWeight = request.getEstimatedWeightKg() != null 
                ? request.getEstimatedWeightKg() 
                : (request.getBagCount() != null ? request.getBagCount() * 4.5 : 4.5);
        pickup.setEstimatedWeightKg(estWeight);

        return pickupRequestRepository.save(pickup);
    }

    public List<PickupRequest> getPickupsForDonor(Long donorId) {
        return pickupRequestRepository.findByDonorIdOrderByCreatedAtDesc(donorId);
    }

    public List<PickupRequest> getAllPickups() {
        return pickupRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<PickupRequest> getAvailableDonations() {
        return pickupRequestRepository.findByStatusInAndAssignedNgoUserIsNullOrderByCreatedAtDesc(
                List.of(PickupStatus.SUBMITTED, PickupStatus.PENDING, PickupStatus.UNDER_REVIEW)
        );
    }

    public List<PickupRequest> getAcceptedDonations(Long ngoUserId) {
        return pickupRequestRepository.findByAssignedNgoUserIdOrderByCreatedAtDesc(ngoUserId);
    }

    public List<PickupRequest> getPickupsForDriver(Long driverId) {
        return pickupRequestRepository.findByDriverIdOrderByScheduledDateAsc(driverId);
    }

    public PickupRequest getPickupById(Long id) {
        return pickupRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Donation request not found: " + id));
    }

    @Transactional
    public PickupRequest acceptDonation(Long pickupId, User ngoUser, String notes) {
        PickupRequest pickup = getPickupById(pickupId);

        // Strict Concurrency & Multi-NGO Protection
        if (pickup.getAssignedNgoUser() != null && !pickup.getAssignedNgoUser().getId().equals(ngoUser.getId())) {
            throw new IllegalStateException("This donation has already been accepted by another organization: " 
                    + (pickup.getAssignedNgoUser().getOrganizationName() != null ? pickup.getAssignedNgoUser().getOrganizationName() : pickup.getAssignedNgoUser().getFullName()));
        }

        if (pickup.getStatus() != PickupStatus.SUBMITTED && pickup.getStatus() != PickupStatus.PENDING && pickup.getStatus() != PickupStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Donation cannot be accepted in its current status: " + pickup.getStatus());
        }

        pickup.setAssignedNgoUser(ngoUser);
        pickup.setStatus(PickupStatus.ACCEPTED);
        if (notes != null && !notes.isBlank()) {
            pickup.setDriverNotes("NGO Acceptance: " + notes);
        }

        return pickupRequestRepository.save(pickup);
    }

    @Transactional
    public PickupRequest declineDonation(Long pickupId, User ngoUser, String reason) {
        PickupRequest pickup = getPickupById(pickupId);

        if (pickup.getAssignedNgoUser() == null || !pickup.getAssignedNgoUser().getId().equals(ngoUser.getId())) {
            throw new IllegalArgumentException("You can only release donations accepted by your organization");
        }

        pickup.setAssignedNgoUser(null);
        pickup.setStatus(PickupStatus.SUBMITTED);
        pickup.setDriverNotes(reason != null ? "Released by NGO: " + reason : "Released back to available pool");

        return pickupRequestRepository.save(pickup);
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

        if (currentUser != null && currentUser.getRole() == Role.ROLE_DONOR &&
                !pickup.getDonor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You can only cancel your own donation requests");
        }

        if (pickup.getStatus() == PickupStatus.PICKED_UP ||
                pickup.getStatus() == PickupStatus.DELIVERED_TO_HUB ||
                pickup.getStatus() == PickupStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel donation that is already " + pickup.getStatus());
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
            throw new IllegalArgumentException("You can only reschedule your own donation requests");
        }

        if (pickup.getStatus() == PickupStatus.PICKED_UP ||
                pickup.getStatus() == PickupStatus.DELIVERED_TO_HUB ||
                pickup.getStatus() == PickupStatus.COMPLETED ||
                pickup.getStatus() == PickupStatus.CANCELLED) {
            throw new IllegalStateException("Cannot reschedule donation with status " + pickup.getStatus());
        }

        pickup.setScheduledDate(request.getNewScheduledDate());
        pickup.setTimeSlot(request.getNewTimeSlot());
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            pickup.setDriverNotes("Rescheduled: " + request.getNotes());
        }
        return pickupRequestRepository.save(pickup);
    }

    public Map<String, Object> getDonorStats(Long donorId) {
        List<PickupRequest> myPickups = pickupRequestRepository.findByDonorIdOrderByCreatedAtDesc(donorId);
        long total = myPickups.size();
        long completed = myPickups.stream().filter(p -> p.getStatus() == PickupStatus.COMPLETED).count();
        long pending = myPickups.stream().filter(p -> p.getStatus() == PickupStatus.SUBMITTED 
                || p.getStatus() == PickupStatus.PENDING 
                || p.getStatus() == PickupStatus.UNDER_REVIEW 
                || p.getStatus() == PickupStatus.ACCEPTED 
                || p.getStatus() == PickupStatus.PICKUP_SCHEDULED 
                || p.getStatus() == PickupStatus.ASSIGNED 
                || p.getStatus() == PickupStatus.PICKED_UP).count();
        
        double totalKg = myPickups.stream()
                .filter(p -> p.getStatus() == PickupStatus.COMPLETED)
                .mapToDouble(p -> p.getEstimatedWeightKg() != null ? p.getEstimatedWeightKg() : 5.0)
                .sum();
        long recoveredItems = myPickups.stream()
                .filter(p -> p.getStatus() == PickupStatus.COMPLETED)
                .mapToLong(p -> p.getQuantity() != null ? p.getQuantity() : 10)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDonations", total);
        stats.put("pendingDonations", pending);
        stats.put("completedDonations", completed);
        stats.put("recoveredItemsCount", recoveredItems);
        stats.put("totalWeightKg", totalKg);
        stats.put("waterSavedLiters", recoveredItems * 2700.0);
        stats.put("co2PreventedKg", recoveredItems * 3.6);
        return stats;
    }

    public Map<String, Object> getNgoStats(Long ngoUserId) {
        long available = pickupRequestRepository.countByStatusInAndAssignedNgoUserIsNull(
                List.of(PickupStatus.SUBMITTED, PickupStatus.PENDING, PickupStatus.UNDER_REVIEW)
        );
        long accepted = pickupRequestRepository.countByAssignedNgoUserId(ngoUserId);
        long completed = pickupRequestRepository.countByAssignedNgoUserIdAndStatus(ngoUserId, PickupStatus.COMPLETED);
        long pendingCollections = accepted - completed;

        Map<String, Object> stats = new HashMap<>();
        stats.put("availableDonations", available);
        stats.put("acceptedDonations", accepted);
        stats.put("completedCollections", completed);
        stats.put("pendingCollections", Math.max(0, pendingCollections));
        return stats;
    }

    @Transactional
    public DonationInvoice ensureInvoiceExists(PickupRequest pickup, Integer verifiedCount) {
        return donationInvoiceRepository.findByPickupRequestId(pickup.getId())
                .orElseGet(() -> {
                    int count = (verifiedCount != null && verifiedCount > 0)
                            ? verifiedCount
                            : (pickup.getBagCount() != null ? pickup.getBagCount() * 8 : 10);
                    double waterSaved = count * 2700.0;
                    double co2Saved = count * 3.6;
                    String invoiceNum = "ECO-80G-" + java.time.Year.now().getValue() + "-" +
                            String.format("%04d", (pickup.getId() * 37) % 9999 + 1);

                    DonationInvoice invoice = new DonationInvoice(pickup, pickup.getDonor(), invoiceNum, count, co2Saved, waterSaved);
                    invoice.setPdfFileUrl("/api/invoices/download/" + pickup.getId());
                    return donationInvoiceRepository.save(invoice);
                });
    }
}
