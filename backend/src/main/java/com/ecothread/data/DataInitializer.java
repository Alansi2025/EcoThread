package com.ecothread.data;

import com.ecothread.model.*;
import com.ecothread.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PickupRequestRepository pickupRequestRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final BeneficiaryOrderRepository orderRepository;
    private final DonationInvoiceRepository invoiceRepository;
    private final NgoPartnerRepository ngoPartnerRepository;
    private final GarmentPassportRepository garmentPassportRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AddressRepository addressRepository,
                           PickupRequestRepository pickupRequestRepository,
                           InventoryItemRepository inventoryItemRepository,
                           BeneficiaryOrderRepository orderRepository,
                           DonationInvoiceRepository invoiceRepository,
                           NgoPartnerRepository ngoPartnerRepository,
                           GarmentPassportRepository garmentPassportRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.pickupRequestRepository = pickupRequestRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.ngoPartnerRepository = ngoPartnerRepository;
        this.garmentPassportRepository = garmentPassportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        System.out.println("🌱 EcoThread: Seeding initial demo users, catalog items, and mock donations...");

        // 1. Seed Users
        String encodedPassword = passwordEncoder.encode("password123");

        User donor = new User("Aarav Sharma", "donor@ecothread.org", encodedPassword, "+91 98450 12345", Role.ROLE_DONOR, 0);
        User beneficiary = new User("Priya Kumari", "beneficiary@ecothread.org", encodedPassword, "+91 98450 67890", Role.ROLE_BENEFICIARY, 150); // 150 seasonal NGO credits
        User beneficiary2 = new User("Lakshmi Devi", "lakshmi@ecothread.org", encodedPassword, "+91 98450 55443", Role.ROLE_BENEFICIARY, 85);
        User beneficiary3 = new User("Anand Swamy", "anand@ecothread.org", encodedPassword, "+91 98450 33221", Role.ROLE_BENEFICIARY, 25);
        User driver = new User("Ramesh Kumar", "driver@ecothread.org", encodedPassword, "+91 98450 11223", Role.ROLE_LOGISTICS, 0);
        User admin = new User("Warehouse Manager - Neha", "admin@ecothread.org", encodedPassword, "+91 98450 99887", Role.ROLE_ADMIN, 0);

        donor = userRepository.save(donor);
        beneficiary = userRepository.save(beneficiary);
        beneficiary2 = userRepository.save(beneficiary2);
        beneficiary3 = userRepository.save(beneficiary3);
        driver = userRepository.save(driver);
        admin = userRepository.save(admin);

        // 2. Seed Addresses
        Address donorAddress = new Address(donor, "42 Richmond Road, Langford Town", "Bengaluru", "Karnataka", "560025", 12.9608, 77.6033);
        Address beneficiaryAddress = new Address(beneficiary, "Flat 12, Community Housing Colony, Whitefield", "Bengaluru", "Karnataka", "560066", 12.9698, 77.7500);
        Address beneficiaryAddress2 = new Address(beneficiary2, "Block C-4, Slum Board Rehabilitation Quarters, Ejipura", "Bengaluru", "Karnataka", "560047", 12.9382, 77.6300);
        addressRepository.save(donorAddress);
        addressRepository.save(beneficiaryAddress);
        addressRepository.save(beneficiaryAddress2);

        // 3. Seed Pickup Requests
        // Pickup 1: COMPLETED (with 80G tax receipt ready)
        PickupRequest completedPickup = new PickupRequest(
                donor,
                donorAddress,
                LocalDate.now().minusDays(3),
                "10:00 AM - 01:00 PM",
                2,
                "Winter Jackets, Formal Shirts, Kids Woolens"
        );
        completedPickup.setStatus(PickupStatus.COMPLETED);
        completedPickup.setDriver(driver);
        completedPickup.setEstimatedWeightKg(8.5);
        completedPickup.setDriverNotes("Verified 14 clean items on doorstep. Seamless handoff.");
        completedPickup = pickupRequestRepository.save(completedPickup);

        // Pickup 2: ASSIGNED (In progress for logistics driver)
        PickupRequest assignedPickup = new PickupRequest(
                donor,
                donorAddress,
                LocalDate.now().plusDays(1),
                "02:00 PM - 05:00 PM",
                3,
                "Denim Jeans, Cotton Tops, Bed Linens"
        );
        assignedPickup.setStatus(PickupStatus.ASSIGNED);
        assignedPickup.setDriver(driver);
        assignedPickup.setEstimatedWeightKg(12.0);
        assignedPickup.setDriverNotes("Contactless pickup requested at security desk.");
        pickupRequestRepository.save(assignedPickup);

        // Pickup 3: PENDING (New pickup awaiting driver assignment)
        PickupRequest pendingPickup = new PickupRequest(
                donor,
                donorAddress,
                LocalDate.now().plusDays(3),
                "09:00 AM - 12:00 PM",
                1,
                "Children's School Uniforms, Sweaters"
        );
        pendingPickup.setStatus(PickupStatus.PENDING);
        pendingPickup.setEstimatedWeightKg(4.0);
        pickupRequestRepository.save(pendingPickup);

        // 4. Seed 80G Tax Invoice for completed donation
        DonationInvoice invoice = new DonationInvoice(
                completedPickup,
                donor,
                "ECO-80G-2026-0042",
                14,
                50.4, // 14 items * 3.6 kg CO2 = 50.4 kg
                37800.0 // 14 items * 2,700 L Water = 37,800 Liters
        );
        invoice.setPdfFileUrl("/api/invoices/download/" + completedPickup.getId());
        invoiceRepository.save(invoice);

        // 5. Seed Catalog Inventory Items (Grade A - Cleaned, pristine garments)
        inventoryItemRepository.save(new InventoryItem(
                "Alpine Fleece-Lined Winter Parka",
                "Ultra-warm weather-resistant winter jacket with fleece lining and detachable hood. Cleaned and sanitized by EcoThread QC.",
                "Outerwear",
                "Men",
                "L",
                "Winter",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80",
                25
        ));

        inventoryItemRepository.save(new InventoryItem(
                "Merino Wool Button-Down Cardigan",
                "Soft 100% merino wool knit cardigan in charcoal grey. Ideal for layering in cold seasons.",
                "Tops & Knitwear",
                "Women",
                "M",
                "Winter",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
                20
        ));

        inventoryItemRepository.save(new InventoryItem(
                "Crisp Oxford Cotton Shirt",
                "Classic pastel blue button-up shirt made from premium breathable woven cotton. Suitable for work and daily wear.",
                "Shirts & Blouses",
                "Men",
                "M",
                "All Season",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
                15
        ));

        inventoryItemRepository.save(new InventoryItem(
                "Handloom Block-Printed Kurti Set",
                "Elegant pure cotton floral block-printed traditional kurti with matching dupatta. Refurbished to pristine state.",
                "Ethnic & Traditional",
                "Women",
                "L",
                "Summer",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
                15
        ));

        inventoryItemRepository.save(new InventoryItem(
                "Children's Waterproof Anorak Jacket",
                "Bright hooded rain jacket with reflective safety strips and taped seams. Keeps children dry on the walk to school.",
                "Kids Wear",
                "Kids",
                "S",
                "Monsoon",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80",
                10
        ));

        inventoryItemRepository.save(new InventoryItem(
                "Relaxed Indigo Selvedge Denims",
                "Durable classic straight-cut denim jeans with sturdy copper rivets. Double washed and quality checked.",
                "Denims & Bottoms",
                "Men",
                "XL",
                "All Season",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
                15
        ));

        inventoryItemRepository.save(new InventoryItem(
                "Toddler Organic Cotton Daywear Set",
                "Soft, hypoallergenic 2-piece lounge tee and drawstring joggers set for toddlers.",
                "Kids Wear",
                "Kids",
                "XS",
                "Summer",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80",
                10
        ));

        inventoryItemRepository.save(new InventoryItem(
                "Thermal Insulated Windbreaker",
                "Lightweight wind and drizzle proof hooded windbreaker in olive green with secure zip pockets.",
                "Outerwear",
                "Unisex",
                "XL",
                "Winter",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80",
                20
        ));

        // 6. Seed Grade B & Recycled items for Warehouse QC demo
        InventoryItem gradeBItem = new InventoryItem(
                "Assorted Flannel Work Shirts (Pack of 3)",
                "Sturdy flannel shirts with minor stitching wear, thoroughly sanitized. Directed to Community Disaster Relief Drive.",
                "Bulk Relief Drives",
                "Men",
                "L",
                "Winter",
                ConditionGrade.GRADE_B,
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
                0
        );
        gradeBItem.setIsAvailable(false);
        gradeBItem.setQcNotes("Routed to Slum Community Winter Aid Drive in North Zone");
        inventoryItemRepository.save(gradeBItem);

        InventoryItem recycleItem = new InventoryItem(
                "Torn Corduroy Fabric Batch (5 Kg)",
                "Heavily frayed corduroy trousers diverted from landfill. Shipped to textile spinning mill for industrial insulation yarn.",
                "Downcycling & Fiber Spinning",
                "Unisex",
                "Free Size",
                "All Season",
                ConditionGrade.RECYCLE_DOWNGRADE,
                "https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80",
                0
        );
        recycleItem.setIsAvailable(false);
        recycleItem.setQcNotes("Processed by EcoShredder facility for automotive acoustic padding");
        inventoryItemRepository.save(recycleItem);

        // 7. Seed sample Beneficiary Order
        BeneficiaryOrder sampleOrder = new BeneficiaryOrder("ORD-2026-8812", beneficiary, beneficiaryAddress, 20);
        sampleOrder.setOrderStatus(OrderStatus.DISPATCHED);
        sampleOrder = orderRepository.save(sampleOrder);

        // 8. Seed Verified Partner NGOs with urgent garment needs & geo-locations
        ngoPartnerRepository.save(new NgoPartner(
                "Goonj Community Recovery Center",
                "Disaster Relief & Rural Livelihoods",
                "Winter Blankets, Heavy Jackets, Men's Warm Sweaters",
                "WINTER_WEAR",
                "Plot No. 1, Sarita Vihar Institutional Area",
                "New Delhi",
                "110076",
                28.5324,
                77.2912,
                "Sunil Kumar",
                "+91 98111 22334",
                "09:00 AM - 06:00 PM (Mon-Sat)",
                "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"
        ));

        ngoPartnerRepository.save(new NgoPartner(
                "Asha Deep Children's Orphanage & Learning Center",
                "Child Welfare & Education",
                "School Uniforms, Children's Cardigans, Ages 5-14 Footwear",
                "KIDS_WEAR",
                "Sector 14, Near Hauz Khas Metro Station",
                "New Delhi",
                "110016",
                28.5494,
                77.2001,
                "Sister Teresa D'Souza",
                "+91 98222 33445",
                "08:30 AM - 07:00 PM (Daily)",
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80"
        ));

        ngoPartnerRepository.save(new NgoPartner(
                "IIT Delhi Student Welfare & Thrift Exchange Hub",
                "Campus Circularity & Student Aid",
                "Hoodies, Denim Jeans, Lab Coats, Tracksuits & Casual Wear",
                "ALL_TYPES",
                "Student Activity Center (SAC), IIT Delhi, Hauz Khas",
                "New Delhi",
                "110016",
                28.5458,
                77.1926,
                "Prof. Arvind Verma",
                "+91 98333 44556",
                "10:00 AM - 08:00 PM (Mon-Fri)",
                "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
        ));

        ngoPartnerRepository.save(new NgoPartner(
                "Prayas Shelter for Homeless & Destitute Adults",
                "Homeless Shelter & Re-integration",
                "Adult Daily Casuals, Warm Shawls, Thermal Inners, Track Pants",
                "DAILY_CASUAL",
                "Near AIIMS Flyover, Ansari Nagar West",
                "New Delhi",
                "110029",
                28.5672,
                77.2100,
                "Manish Tiwari",
                "+91 98444 55667",
                "24/7 Drop-off Accepted",
                "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80"
        ));

        ngoPartnerRepository.save(new NgoPartner(
                "Udaan Women's Skill & Garment Cooperative",
                "Women's Empowerment & Artisan Upcycling",
                "Cotton Sarees, Kurtas, Salwar Suits, Fabric Scraps for Patchwork",
                "FORMAL_ADULT",
                "Street 7, Khirki Village, Malviya Nagar",
                "New Delhi",
                "110017",
                28.5312,
                77.2185,
                "Rekha Sharma",
                "+91 98555 66778",
                "09:30 AM - 05:30 PM (Mon-Fri)",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
        ));

        ngoPartnerRepository.save(new NgoPartner(
                "Robin Hood Army Warmth Drive - Okhla Hub",
                "Night Shelter & Cold Weather Emergency",
                "Woolen Caps, Gloves, Mufflers, Winter Quilts & Sleeping Blankets",
                "WINTER_WEAR",
                "Phase III, Okhla Industrial Estate",
                "New Delhi",
                "110020",
                28.5355,
                77.2731,
                "Kunal Bahl",
                "+91 98666 77889",
                "07:00 PM - 11:00 PM (Winter Night Drives)",
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
        ));

        // 9. Seed Garment Digital Passports for End-to-End Traceability
        garmentPassportRepository.save(new GarmentPassport(
                "ECO-TRC-2026-8841",
                "Vintage Reclaimed Denim Sherpa Jacket",
                "Outerwear",
                "100% Heavyweight Cotton Denim, Recycled Sherpa Fleece Lining",
                1.35,
                "Hostel Block 4 (Aryabhatta Hall)",
                ConditionGrade.GRADE_A,
                "CONFIRMED_RECOVERED",
                "REUSED_STUDENT_STORE",
                "EcoThread Student Wardrobe Hub",
                10125.0,
                4.86,
                "https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=800&q=80",
                "• [2026-10-24 10:15] Collected at IIT Delhi Hostel Block 4 move-out checkpoint (Weight: 1.35 kg)\n" +
                "• [2026-10-24 14:30] EcoGrade AI Assessment completed: 97.4% confidence (Grade A Reuse)\n" +
                "• [2026-10-25 09:00] Steam sanitized and RFID passport attached at EcoThread Central Warehouse\n" +
                "• [2026-10-26 16:45] Dispatched and redeemed by Beneficiary Student Priya Kumari (Order ORD-2026-8812)"
        ));

        garmentPassportRepository.save(new GarmentPassport(
                "ECO-TRC-2026-7732",
                "Hand-Knitted Cable Wool Cardigan",
                "Knitwear",
                "85% Merino Wool, 15% Reclaimed Polyamide",
                0.72,
                "Hostel Block 7 (Kalpana Chawla Hall)",
                ConditionGrade.GRADE_A,
                "CONFIRMED_RECOVERED",
                "REPAIRED_UPCYCLED",
                "EcoThread Artisan Upcycling Studio",
                6408.0,
                3.52,
                "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80",
                "• [2026-10-25 11:00] Collected at Kalpana Chawla Hall donation bin (Weight: 0.72 kg)\n" +
                "• [2026-10-25 15:20] EcoGrade AI flagged missing top horn button; recommended Artisan Upcycle repair\n" +
                "• [2026-10-26 11:30] Upcycling Studio replaced button with hand-carved coconut shell button\n" +
                "• [2026-10-27 10:00] Confirmed restored to Grade-A catalog standard"
        ));

        garmentPassportRepository.save(new GarmentPassport(
                "ECO-TRC-2026-5519",
                "Faded Cotton Flannel Shirts Bundle (x5)",
                "Casual Tops",
                "100% Brushed Cotton Weave",
                1.40,
                "Hostel Block 1 (Raman House)",
                ConditionGrade.GRADE_B,
                "CONFIRMED_RECOVERED",
                "COMMUNITY_SHELTER_DISTRIBUTION",
                "Goonj Community Recovery Center",
                10500.0,
                5.04,
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
                "• [2026-10-25 16:40] Collected at Raman House move-out lot\n" +
                "• [2026-10-26 09:15] EcoGrade AI Assessment: Grade B (Intact seams, aesthetic wash fade)\n" +
                "• [2026-10-27 14:00] Packaged into Community Aid Baled Bundle #42\n" +
                "• [2026-10-28 08:30] Confirmed received by Goonj Sarita Vihar shelter for winter distribution"
        ));

        garmentPassportRepository.save(new GarmentPassport(
                "ECO-TRC-2026-3304",
                "Damaged Polyester Athletic Jersey Scrap Lot",
                "Activewear",
                "100% Micro-Polyester Mesh (Torn & Frayed)",
                2.10,
                "Sports Complex Locker Cleanout",
                ConditionGrade.GRADE_C,
                "CONFIRMED_RECOVERED",
                "INDUSTRIAL_FIBER_SHREDDED",
                "Shivalik Circular Textile Shredders",
                3990.0,
                12.18,
                "https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80",
                "• [2026-10-26 12:00] Collected at Sports Complex textile bin\n" +
                "• [2026-10-26 16:00] EcoGrade AI Vision: Multiple irreversible tears & burns; routed to Grade C downcycling\n" +
                "• [2026-10-27 15:30] Baled into 50kg lot #SHIV-992 for mechanical garnetting\n" +
                "• [2026-10-28 09:15] Shivalik Mills confirmed shredded into automotive acoustic door insulation (Zero landfill waste)"
        ));

        System.out.println("✅ EcoThread: Sample seed data successfully initialized!");
        System.out.println("   Donor: donor@ecothread.org (password123)");
        System.out.println("   Beneficiary: beneficiary@ecothread.org (password123, 150 credits)");
        System.out.println("   Logistics Driver: driver@ecothread.org (password123)");
        System.out.println("   Admin: admin@ecothread.org (password123)");
    }
}
