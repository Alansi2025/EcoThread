package com.ecothread.dto;

import java.util.List;

public class LiveTelemetryDto {

    public static class GeoCoordinate {
        private Double lat;
        private Double lng;
        private String label;
        private String address;

        public GeoCoordinate() {}

        public GeoCoordinate(Double lat, Double lng, String label, String address) {
            this.lat = lat;
            this.lng = lng;
            this.label = label;
            this.address = address;
        }

        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }

        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }

    public static class LogisticsPartnerLiveDto {
        private Long id;
        private String driverName;
        private String driverPhone;
        private String driverPhoto;
        private String vehicleId;
        private String vehicleModel;
        private String vehicleType; // EV_CARGO_VAN, EV_CARGO_TRUCK, EV_CARGO_BIKE
        private Double currentLat;
        private Double currentLng;
        private Double heading; // 0 to 360 degrees
        private Double speedKmh;
        private Integer batteryPercent;
        private String status; // EN_ROUTE_PICKUP, TRANSIT_TO_NGO, DELIVERED_COLLECTION, CAMPUS_EXCHANGE
        private String statusText;
        private Long assignedPickupId;
        private Long targetNgoId;
        private String targetNgoName;
        private Integer etaMinutes;
        private Double distanceToDonorKm;
        private Double distanceToNgoKm;
        private List<List<Double>> routeCoordinates; // [[lat, lng], [lat, lng], ...]

        public LogisticsPartnerLiveDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getDriverName() { return driverName; }
        public void setDriverName(String driverName) { this.driverName = driverName; }

        public String getDriverPhone() { return driverPhone; }
        public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }

        public String getDriverPhoto() { return driverPhoto; }
        public void setDriverPhoto(String driverPhoto) { this.driverPhoto = driverPhoto; }

        public String getVehicleId() { return vehicleId; }
        public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

        public Double getCurrentLat() { return currentLat; }
        public void setCurrentLat(Double currentLat) { this.currentLat = currentLat; }

        public Double getCurrentLng() { return currentLng; }
        public void setCurrentLng(Double currentLng) { this.currentLng = currentLng; }

        public Double getHeading() { return heading; }
        public void setHeading(Double heading) { this.heading = heading; }

        public Double getSpeedKmh() { return speedKmh; }
        public void setSpeedKmh(Double speedKmh) { this.speedKmh = speedKmh; }

        public Integer getBatteryPercent() { return batteryPercent; }
        public void setBatteryPercent(Integer batteryPercent) { this.batteryPercent = batteryPercent; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getStatusText() { return statusText; }
        public void setStatusText(String statusText) { this.statusText = statusText; }

        public Long getAssignedPickupId() { return assignedPickupId; }
        public void setAssignedPickupId(Long assignedPickupId) { this.assignedPickupId = assignedPickupId; }

        public Long getTargetNgoId() { return targetNgoId; }
        public void setTargetNgoId(Long targetNgoId) { this.targetNgoId = targetNgoId; }

        public String getTargetNgoName() { return targetNgoName; }
        public void setTargetNgoName(String targetNgoName) { this.targetNgoName = targetNgoName; }

        public Integer getEtaMinutes() { return etaMinutes; }
        public void setEtaMinutes(Integer etaMinutes) { this.etaMinutes = etaMinutes; }

        public Double getDistanceToDonorKm() { return distanceToDonorKm; }
        public void setDistanceToDonorKm(Double distanceToDonorKm) { this.distanceToDonorKm = distanceToDonorKm; }

        public Double getDistanceToNgoKm() { return distanceToNgoKm; }
        public void setDistanceToNgoKm(Double distanceToNgoKm) { this.distanceToNgoKm = distanceToNgoKm; }

        public List<List<Double>> getRouteCoordinates() { return routeCoordinates; }
        public void setRouteCoordinates(List<List<Double>> routeCoordinates) { this.routeCoordinates = routeCoordinates; }
    }

    private GeoCoordinate donorLocation;
    private List<NgoLocatorDto> ngos;
    private List<LogisticsPartnerLiveDto> logisticsFleet;
    private Integer activeVehiclesCount;
    private Integer partnerNgosCount;
    private Double networkCo2SavedFleetKg;
    private String lastUpdatedTimestamp;

    public LiveTelemetryDto() {}

    public GeoCoordinate getDonorLocation() { return donorLocation; }
    public void setDonorLocation(GeoCoordinate donorLocation) { this.donorLocation = donorLocation; }

    public List<NgoLocatorDto> getNgos() { return ngos; }
    public void setNgos(List<NgoLocatorDto> ngos) { this.ngos = ngos; }

    public List<LogisticsPartnerLiveDto> getLogisticsFleet() { return logisticsFleet; }
    public void setLogisticsFleet(List<LogisticsPartnerLiveDto> logisticsFleet) { this.logisticsFleet = logisticsFleet; }

    public Integer getActiveVehiclesCount() { return activeVehiclesCount; }
    public void setActiveVehiclesCount(Integer activeVehiclesCount) { this.activeVehiclesCount = activeVehiclesCount; }

    public Integer getPartnerNgosCount() { return partnerNgosCount; }
    public void setPartnerNgosCount(Integer partnerNgosCount) { this.partnerNgosCount = partnerNgosCount; }

    public Double getNetworkCo2SavedFleetKg() { return networkCo2SavedFleetKg; }
    public void setNetworkCo2SavedFleetKg(Double networkCo2SavedFleetKg) { this.networkCo2SavedFleetKg = networkCo2SavedFleetKg; }

    public String getLastUpdatedTimestamp() { return lastUpdatedTimestamp; }
    public void setLastUpdatedTimestamp(String lastUpdatedTimestamp) { this.lastUpdatedTimestamp = lastUpdatedTimestamp; }
}
