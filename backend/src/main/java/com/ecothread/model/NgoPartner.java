package com.ecothread.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ngo_partners")
public class NgoPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // e.g., "Disaster Relief & Homeless Shelter", "Child Welfare & Orphanage", "Elder Care & Night Shelter", "Women's Empowerment"

    @Column(nullable = false, length = 1000)
    private String urgentNeeds; // e.g., "Winter Blankets, Heavy Jackets, Men's Sweaters"

    @Column(nullable = false)
    private String neededGarmentType; // "WINTER_WEAR", "KIDS_WEAR", "FORMAL_ADULT", "DAILY_CASUAL", "ALL_TYPES"

    @Column(nullable = false)
    private String streetAddress;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String pincode;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String contactPerson;
    private String contactPhone;
    private String operatingHours; // e.g., "09:00 AM - 07:00 PM (Mon-Sat)"

    private Boolean verified = true;
    private Integer totalClothesReceived = 0;
    private String imageUrl;

    public NgoPartner() {}

    public NgoPartner(String name, String category, String urgentNeeds, String neededGarmentType,
                      String streetAddress, String city, String pincode, Double latitude, Double longitude,
                      String contactPerson, String contactPhone, String operatingHours, String imageUrl) {
        this.name = name;
        this.category = category;
        this.urgentNeeds = urgentNeeds;
        this.neededGarmentType = neededGarmentType;
        this.streetAddress = streetAddress;
        this.city = city;
        this.pincode = pincode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.contactPerson = contactPerson;
        this.contactPhone = contactPhone;
        this.operatingHours = operatingHours;
        this.imageUrl = imageUrl;
        this.verified = true;
        this.totalClothesReceived = 150 + (int)(Math.random() * 850);
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
}
