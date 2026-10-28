package com.ecothread.repository;

import com.ecothread.model.PickupRequest;
import com.ecothread.model.PickupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {
    List<PickupRequest> findByDonorIdOrderByCreatedAtDesc(Long donorId);
    List<PickupRequest> findByDriverIdOrderByScheduledDateAsc(Long driverId);
    List<PickupRequest> findByStatusOrderByCreatedAtDesc(PickupStatus status);
    List<PickupRequest> findAllByOrderByCreatedAtDesc();
    
    // NGO workflows
    List<PickupRequest> findByAssignedNgoUserIdOrderByCreatedAtDesc(Long ngoUserId);
    List<PickupRequest> findByStatusInAndAssignedNgoUserIsNullOrderByCreatedAtDesc(List<PickupStatus> statuses);

    // Stats
    long countByDonorId(Long donorId);
    long countByDonorIdAndStatus(Long donorId, PickupStatus status);
    long countByAssignedNgoUserId(Long ngoUserId);
    long countByAssignedNgoUserIdAndStatus(Long ngoUserId, PickupStatus status);
    long countByStatusInAndAssignedNgoUserIsNull(List<PickupStatus> statuses);
}
