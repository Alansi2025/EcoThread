package com.ecothread.repository;

import com.ecothread.model.DonationInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationInvoiceRepository extends JpaRepository<DonationInvoice, Long> {
    Optional<DonationInvoice> findByInvoiceNumber(String invoiceNumber);
    Optional<DonationInvoice> findByPickupRequestId(Long pickupRequestId);
    List<DonationInvoice> findByDonorIdOrderByIssuedAtDesc(Long donorId);
}
