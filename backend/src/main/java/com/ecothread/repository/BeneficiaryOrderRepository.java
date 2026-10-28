package com.ecothread.repository;

import com.ecothread.model.BeneficiaryOrder;
import com.ecothread.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BeneficiaryOrderRepository extends JpaRepository<BeneficiaryOrder, Long> {
    List<BeneficiaryOrder> findByBeneficiaryIdOrderByCreatedAtDesc(Long beneficiaryId);
    List<BeneficiaryOrder> findByOrderStatusOrderByCreatedAtDesc(OrderStatus status);
    List<BeneficiaryOrder> findAllByOrderByCreatedAtDesc();
}
