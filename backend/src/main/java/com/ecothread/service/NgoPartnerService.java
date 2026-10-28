package com.ecothread.service;

import com.ecothread.dto.NgoLocatorDto;
import com.ecothread.model.NgoPartner;
import com.ecothread.repository.NgoPartnerRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NgoPartnerService {

    private final NgoPartnerRepository ngoPartnerRepository;

    public NgoPartnerService(NgoPartnerRepository ngoPartnerRepository) {
        this.ngoPartnerRepository = ngoPartnerRepository;
    }

    public List<NgoLocatorDto> getNearbyNgos(Double userLat, Double userLng, String garmentType) {
        List<NgoPartner> all = ngoPartnerRepository.findAll();

        return all.stream()
                .filter(ngo -> {
                    if (garmentType == null || garmentType.isBlank() || "ALL".equalsIgnoreCase(garmentType)) {
                        return true;
                    }
                    return garmentType.equalsIgnoreCase(ngo.getNeededGarmentType()) || "ALL_TYPES".equalsIgnoreCase(ngo.getNeededGarmentType());
                })
                .map(ngo -> new NgoLocatorDto(ngo, userLat, userLng))
                .sorted(Comparator.comparingDouble(NgoLocatorDto::getDistanceKm))
                .collect(Collectors.toList());
    }

    public NgoLocatorDto getNgoById(Long id, Double userLat, Double userLng) {
        NgoPartner ngo = ngoPartnerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("NGO partner not found: " + id));
        return new NgoLocatorDto(ngo, userLat, userLng);
    }
}
