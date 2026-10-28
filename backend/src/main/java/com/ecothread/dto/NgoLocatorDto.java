package com.ecothread.dto;

import com.ecothread.model.NgoPartner;

public class NgoLocatorDto {

    private Long id;
    private String name;
    private String category;
    private String urgentNeeds;
    private String neededGarmentType;
    private String streetAddress;
    private String city;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String contactPerson;
    private String contactPhone;
    private String operatingHours;
    private Boolean verified;
    private Integer totalClothesReceived;
    private String imageUrl;

    // Geo & Travel calculations from User Location
    private Double distanceKm;
    
    // CO2 Emissions by Travel Mode (kg CO2)
    private Double walkingBicycleCo2Kg = 0.0;
    private Double publicTransitCo2Kg; // ~0.04 kg CO2 / passenger-km (electric bus / metro)
    private Double electricVehicleCo2Kg; // ~0.05 kg CO2 / km
    private Double petrolCarCo2Kg; // ~0.17 kg CO2 / km

    // Travel durations in minutes
    private Integer walkingDurationMin;
    private Integer publicTransitDurationMin;
    private Integer drivingDurationMin;

    // Net Ecological Benefit (Donation LCA offset - travel carbon)
    private Double netCo2AvoidedKg; // Based on 5 garments ~ 18.0 kg CO2 saved vs travel cost
    private String ecoTravelAdvice;

    public NgoLocatorDto() {}

    public NgoLocatorDto(NgoPartner ngo, Double userLat, Double userLng) {
        this.id = ngo.getId();
        this.name = ngo.getName();
        this.category = ngo.getCategory();
        this.urgentNeeds = ngo.getUrgentNeeds();
        this.neededGarmentType = ngo.getNeededGarmentType();
        this.streetAddress = ngo.getStreetAddress();
        this.city = ngo.getCity();
        this.pincode = ngo.getPincode();
        this.latitude = ngo.getLatitude();
        this.longitude = ngo.getLongitude();
        this.contactPerson = ngo.getContactPerson();
        this.contactPhone = ngo.getContactPhone();
        this.operatingHours = ngo.getOperatingHours();
        this.verified = ngo.getVerified();
        this.totalClothesReceived = ngo.getTotalClothesReceived();
        this.imageUrl = ngo.getImageUrl();

        // Calculate Distance
        if (userLat != null && userLng != null && ngo.getLatitude() != null && ngo.getLongitude() != null) {
            this.distanceKm = calculateDistanceKm(userLat, userLng, ngo.getLatitude(), ngo.getLongitude());
        } else {
            this.distanceKm = 4.2; // default fallback distance
        }

        // Calculate CO2 emissions for each travel mode
        this.walkingBicycleCo2Kg = 0.0;
        this.publicTransitCo2Kg = Math.round(distanceKm * 0.04 * 100.0) / 100.0;
        this.electricVehicleCo2Kg = Math.round(distanceKm * 0.05 * 100.0) / 100.0;
        this.petrolCarCo2Kg = Math.round(distanceKm * 0.17 * 100.0) / 100.0;

        // Calculate estimated travel durations
        this.walkingDurationMin = (int) Math.round((distanceKm / 4.5) * 60);
        this.publicTransitDurationMin = Math.max(10, (int) Math.round((distanceKm / 20.0) * 60) + 5);
        this.drivingDurationMin = Math.max(5, (int) Math.round((distanceKm / 30.0) * 60));

        // Average 5-item donation avoids ~18.0 kg CO2. Subtract petrol travel emission:
        this.netCo2AvoidedKg = Math.round((18.0 - this.petrolCarCo2Kg) * 100.0) / 100.0;

        if (distanceKm <= 2.5) {
            this.ecoTravelAdvice = "Eco-Choice: Walking or cycling takes " + walkingDurationMin + " mins with ZERO emissions!";
        } else if (distanceKm <= 10.0) {
            this.ecoTravelAdvice = "Eco-Choice: Take Public Metro/Bus (" + publicTransitCo2Kg + " kg CO2) or EV to minimize footprint.";
        } else {
            this.ecoTravelAdvice = "Eco-Choice: Combine with doorstep logistics pickup or shared EV trip to optimize emissions.";
        }
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of Earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUrgentNeeds() { return urgentNeeds; }
    public void setUrgentNeeds(String urgentNeeds) { this.urgentNeeds = urgentNeeds; }

    public String getNeededGarmentType() { return neededGarmentType; }
    public void setNeededGarmentType(String neededGarmentType) { this.neededGarmentType = neededGarmentType; }

    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public Integer getTotalClothesReceived() { return totalClothesReceived; }
    public void setTotalClothesReceived(Integer totalClothesReceived) { this.totalClothesReceived = totalClothesReceived; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Double getWalkingBicycleCo2Kg() { return walkingBicycleCo2Kg; }
    public void setWalkingBicycleCo2Kg(Double walkingBicycleCo2Kg) { this.walkingBicycleCo2Kg = walkingBicycleCo2Kg; }

    public Double getPublicTransitCo2Kg() { return publicTransitCo2Kg; }
    public void setPublicTransitCo2Kg(Double publicTransitCo2Kg) { this.publicTransitCo2Kg = publicTransitCo2Kg; }

    public Double getElectricVehicleCo2Kg() { return electricVehicleCo2Kg; }
    public void setElectricVehicleCo2Kg(Double electricVehicleCo2Kg) { this.electricVehicleCo2Kg = electricVehicleCo2Kg; }

    public Double getPetrolCarCo2Kg() { return petrolCarCo2Kg; }
    public void setPetrolCarCo2Kg(Double petrolCarCo2Kg) { this.petrolCarCo2Kg = petrolCarCo2Kg; }

    public Integer getWalkingDurationMin() { return walkingDurationMin; }
    public void setWalkingDurationMin(Integer walkingDurationMin) { this.walkingDurationMin = walkingDurationMin; }

    public Integer getPublicTransitDurationMin() { return publicTransitDurationMin; }
    public void setPublicTransitDurationMin(Integer publicTransitDurationMin) { this.publicTransitDurationMin = publicTransitDurationMin; }

    public Integer getDrivingDurationMin() { return drivingDurationMin; }
    public void setDrivingDurationMin(Integer drivingDurationMin) { this.drivingDurationMin = drivingDurationMin; }

    public Double getNetCo2AvoidedKg() { return netCo2AvoidedKg; }
    public void setNetCo2AvoidedKg(Double netCo2AvoidedKg) { this.netCo2AvoidedKg = netCo2AvoidedKg; }

    public String getEcoTravelAdvice() { return ecoTravelAdvice; }
    public void setEcoTravelAdvice(String ecoTravelAdvice) { this.ecoTravelAdvice = ecoTravelAdvice; }
}
