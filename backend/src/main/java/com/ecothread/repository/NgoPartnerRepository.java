package com.ecothread.repository;

import com.ecothread.model.NgoPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NgoPartnerRepository extends JpaRepository<NgoPartner, Long> {
    List<NgoPartner> findByNeededGarmentType(String neededGarmentType);
    List<NgoPartner> findByCityIgnoreCase(String city);
}
