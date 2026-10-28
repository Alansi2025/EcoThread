package com.ecothread.repository;

import com.ecothread.model.InventoryItem;
import com.ecothread.model.ConditionGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long>, JpaSpecificationExecutor<InventoryItem> {

    List<InventoryItem> findByIsAvailableTrueAndConditionGrade(ConditionGrade conditionGrade);

    List<InventoryItem> findByConditionGrade(ConditionGrade conditionGrade);
    
    long countByConditionGrade(ConditionGrade conditionGrade);
}
