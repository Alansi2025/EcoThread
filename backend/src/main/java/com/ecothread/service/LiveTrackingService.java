package com.ecothread.service;

import com.ecothread.dto.LiveTelemetryDto;
import com.ecothread.dto.NgoLocatorDto;
import com.ecothread.model.NgoPartner;
import com.ecothread.model.PickupRequest;
import com.ecothread.model.User;
import com.ecothread.repository.NgoPartnerRepository;
import com.ecothread.repository.PickupRequestRepository;
import com.ecothread.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class LiveTrackingService {

    private final NgoPartnerRepository ngoPartnerRepository;
    private final PickupRequestRepository pickupRequestRepository;
    private final UserRepository userRepository;

    public LiveTrackingService(NgoPartnerRepository ngoPartnerRepository,
                               PickupRequestRepository pickupRequestRepository,
                               UserRepository userRepository) {
        this.ngoPartnerRepository = ngoPartnerRepository;
        this.pickupRequestRepository = pickupRequestRepository;
        this.userRepository = userRepository;
    }

    public LiveTelemetryDto getLiveTelemetry(Double customLat, Double customLng, Long pickupId) {
        LiveTelemetryDto dto = new LiveTelemetryDto();

        // 1. Determine Donor coordinates
        double donorLat = (customLat != null) ? customLat : 28.5458;
        double donorLng = (customLng != null) ? customLng : 77.1926;
        String donorAddress = "42 Richmond Road / SAC Hauz Khas, New Delhi";
        String donorLabel = "Your Pickup Location (Doorstep)";

        if (pickupId != null && customLat == null) {
            Optional<PickupRequest> reqOpt = pickupRequestRepository.findById(pickupId);
            if (reqOpt.isPresent() && reqOpt.get().getPickupAddress() != null) {
                PickupRequest req = reqOpt.get();
                if (req.getPickupAddress().getLatitude() != null && req.getPickupAddress().getLongitude() != null) {
                    // If pickup is in Delhi NCR bounds, use directly; otherwise adapt to local metro hub
                    if (req.getPickupAddress().getLatitude() > 25.0 && req.getPickupAddress().getLatitude() < 31.0) {
                        donorLat = req.getPickupAddress().getLatitude();
                        donorLng = req.getPickupAddress().getLongitude();
                    } else {
                        // Project to Delhi NCR Doorstep Hub for local circularity network demonstration
                        donorLat = 28.5494;
                        donorLng = 77.2001;
                    }
                }
                donorAddress = req.getPickupAddress().getStreetAddress() + ", " + req.getPickupAddress().getCity();
                donorLabel = "Your Doorstep (Pickup #" + req.getId() + ")";
            }
        }

        dto.setDonorLocation(new LiveTelemetryDto.GeoCoordinate(donorLat, donorLng, donorLabel, donorAddress));

        // 2. Fetch all Partner NGOs and calculate distance from donor
        List<NgoPartner> ngoList = ngoPartnerRepository.findAll();
        List<NgoLocatorDto> ngoDtos = new ArrayList<>();
        for (NgoPartner ngo : ngoList) {
            ngoDtos.add(new NgoLocatorDto(ngo, donorLat, donorLng));
        }
        dto.setNgos(ngoDtos);
        dto.setPartnerNgosCount(ngoDtos.size());

        // 3. Compute Real-time Moving Logistics Fleet Telemetry
        long nowSec = System.currentTimeMillis() / 1000;
        List<LiveTelemetryDto.LogisticsPartnerLiveDto> fleet = new ArrayList<>();

        // Vehicle 1: Tata Ace EV - Assigned to Donor Doorstep Pickup & Goonj Shelter
        LiveTelemetryDto.LogisticsPartnerLiveDto v1 = new LiveTelemetryDto.LogisticsPartnerLiveDto();
        v1.setId(1L);
        v1.setDriverName("Ramesh Kumar (Lead Logistics Specialist)");
        v1.setDriverPhone("+91 98450 11223");
        v1.setDriverPhoto("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80");
        v1.setVehicleId("DL-01-EV-4421");
        v1.setVehicleModel("Tata Ace Electric (Zero-Emission Fleet)");
        v1.setVehicleType("EV_CARGO_VAN");

        // Target NGO: Goonj (id 1 or first ngo)
        NgoPartner goonj = ngoList.stream()
                .filter(n -> n.getName().contains("Goonj"))
                .findFirst()
                .orElse(!ngoList.isEmpty() ? ngoList.get(0) : null);

        double targetLat = goonj != null ? goonj.getLatitude() : 28.5324;
        double targetLng = goonj != null ? goonj.getLongitude() : 77.2912;
        v1.setTargetNgoId(goonj != null ? goonj.getId() : 1L);
        v1.setTargetNgoName(goonj != null ? goonj.getName() : "Goonj Community Recovery Center");
        v1.setAssignedPickupId(pickupId != null ? pickupId : 2L);

        // Interpolate along route based on time (60-sec cycle back and forth)
        double cycleProgress1 = Math.abs(Math.sin((nowSec % 120) * (Math.PI / 120.0)));
        // Interpolate between donor location and target NGO with slight road deviations
        double v1Lat = donorLat + (targetLat - donorLat) * (0.15 + cycleProgress1 * 0.5) + (Math.sin(nowSec / 10.0) * 0.0012);
        double v1Lng = donorLng + (targetLng - donorLng) * (0.15 + cycleProgress1 * 0.5) + (Math.cos(nowSec / 10.0) * 0.0012);
        v1.setCurrentLat(Math.round(v1Lat * 100000.0) / 100000.0);
        v1.setCurrentLng(Math.round(v1Lng * 100000.0) / 100000.0);
        v1.setHeading(115.0);
        v1.setSpeedKmh(24.0 + (nowSec % 12));
        v1.setBatteryPercent(86);
        v1.setStatus("EN_ROUTE_PICKUP");
        v1.setStatusText("Approaching donor doorstep for scheduled garment collection");
        v1.setEtaMinutes(Math.max(4, (int) Math.round((1.0 - cycleProgress1) * 16)));
        v1.setDistanceToDonorKm(Math.round(calculateDistanceKm(v1Lat, v1Lng, donorLat, donorLng) * 10.0) / 10.0);
        v1.setDistanceToNgoKm(Math.round(calculateDistanceKm(v1Lat, v1Lng, targetLat, targetLng) * 10.0) / 10.0);

        // Waypoints for Route Polyline: Donor -> Van -> Goonj Shelter
        v1.setRouteCoordinates(Arrays.asList(
                Arrays.asList(donorLat, donorLng),
                Arrays.asList(donorLat + (v1Lat - donorLat) * 0.5, donorLng + (v1Lng - donorLng) * 0.4),
                Arrays.asList(v1.getCurrentLat(), v1.getCurrentLng()),
                Arrays.asList(v1Lat + (targetLat - v1Lat) * 0.5, v1Lng + (targetLng - v1Lng) * 0.6),
                Arrays.asList(targetLat, targetLng)
        ));
        fleet.add(v1);

        // Vehicle 2: Euler HiLoad EV - Transfer to Robin Hood Army Warmth Drive (Okhla Hub)
        NgoPartner okhla = ngoList.stream()
                .filter(n -> n.getName().contains("Okhla") || n.getName().contains("Robin Hood"))
                .findFirst()
                .orElse(null);

        double okhlaLat = okhla != null ? okhla.getLatitude() : 28.5355;
        double okhlaLng = okhla != null ? okhla.getLongitude() : 77.2731;

        LiveTelemetryDto.LogisticsPartnerLiveDto v2 = new LiveTelemetryDto.LogisticsPartnerLiveDto();
        v2.setId(2L);
        v2.setDriverName("Vikram Rathore (Inter-Hub Fleet Specialist)");
        v2.setDriverPhone("+91 98450 44556");
        v2.setDriverPhoto("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80");
        v2.setVehicleId("DL-03-EV-8819");
        v2.setVehicleModel("Euler HiLoad Electric (3-Wheeler Cargo EV)");
        v2.setVehicleType("EV_CARGO_TRUCK");
        v2.setTargetNgoId(okhla != null ? okhla.getId() : 4L);
        v2.setTargetNgoName(okhla != null ? okhla.getName() : "Robin Hood Army Warmth Drive - Okhla Hub");

        double cycleProgress2 = Math.abs(Math.cos((nowSec % 90) * (Math.PI / 90.0)));
        double v2Lat = 28.5390 + (cycleProgress2 * 0.008);
        double v2Lng = 77.2580 + (cycleProgress2 * 0.012);
        v2.setCurrentLat(Math.round(v2Lat * 100000.0) / 100000.0);
        v2.setCurrentLng(Math.round(v2Lng * 100000.0) / 100000.0);
        v2.setHeading(82.0);
        v2.setSpeedKmh(31.5);
        v2.setBatteryPercent(72);
        v2.setStatus("TRANSIT_TO_NGO");
        v2.setStatusText("Transferring 65 cleaned winter jackets directly to Okhla Shelter");
        v2.setEtaMinutes(12);
        v2.setDistanceToDonorKm(Math.round(calculateDistanceKm(v2Lat, v2Lng, donorLat, donorLng) * 10.0) / 10.0);
        v2.setDistanceToNgoKm(Math.round(calculateDistanceKm(v2Lat, v2Lng, okhlaLat, okhlaLng) * 10.0) / 10.0);
        v2.setRouteCoordinates(Arrays.asList(
                Arrays.asList(28.5390, 77.2400),
                Arrays.asList(v2.getCurrentLat(), v2.getCurrentLng()),
                Arrays.asList(okhlaLat, okhlaLng)
        ));
        fleet.add(v2);

        // Vehicle 3: Campus Courier EV Bike - Connecting Hauz Khas & SAC
        NgoPartner studentHub = ngoList.stream()
                .filter(n -> n.getName().contains("Student") || n.getName().contains("IIT"))
                .findFirst()
                .orElse(null);

        double studentLat = studentHub != null ? studentHub.getLatitude() : 28.5458;
        double studentLng = studentHub != null ? studentHub.getLongitude() : 77.1926;

        LiveTelemetryDto.LogisticsPartnerLiveDto v3 = new LiveTelemetryDto.LogisticsPartnerLiveDto();
        v3.setId(3L);
        v3.setDriverName("Amit Rawat (Campus Courier Partner)");
        v3.setDriverPhone("+91 98450 77889");
        v3.setDriverPhoto("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80");
        v3.setVehicleId("DL-09-EV-1022");
        v3.setVehicleModel("Hero Electric Cargo Scooter (Campus Circularity)");
        v3.setVehicleType("EV_CARGO_BIKE");
        v3.setTargetNgoId(studentHub != null ? studentHub.getId() : 3L);
        v3.setTargetNgoName(studentHub != null ? studentHub.getName() : "IIT Delhi Student Welfare Hub");

        double cycleProgress3 = Math.sin((nowSec % 60) * (Math.PI / 60.0));
        double v3Lat = 28.5480 + (cycleProgress3 * 0.003);
        double v3Lng = 77.1950 - (cycleProgress3 * 0.002);
        v3.setCurrentLat(Math.round(v3Lat * 100000.0) / 100000.0);
        v3.setCurrentLng(Math.round(v3Lng * 100000.0) / 100000.0);
        v3.setHeading(240.0);
        v3.setSpeedKmh(19.0);
        v3.setBatteryPercent(94);
        v3.setStatus("CAMPUS_EXCHANGE");
        v3.setStatusText("Redistributing dorm move-out clothing to student thrift exchange hub");
        v3.setEtaMinutes(5);
        v3.setDistanceToDonorKm(Math.round(calculateDistanceKm(v3Lat, v3Lng, donorLat, donorLng) * 10.0) / 10.0);
        v3.setDistanceToNgoKm(Math.round(calculateDistanceKm(v3Lat, v3Lng, studentLat, studentLng) * 10.0) / 10.0);
        v3.setRouteCoordinates(Arrays.asList(
                Arrays.asList(28.5510, 77.1970),
                Arrays.asList(v3.getCurrentLat(), v3.getCurrentLng()),
                Arrays.asList(studentLat, studentLng)
        ));
        fleet.add(v3);

        dto.setLogisticsFleet(fleet);
        dto.setActiveVehiclesCount(fleet.size());
        dto.setNetworkCo2SavedFleetKg(184.2);
        dto.setLastUpdatedTimestamp(Instant.now().toString());

        return dto;
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
