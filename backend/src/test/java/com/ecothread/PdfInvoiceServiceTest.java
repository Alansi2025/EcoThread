package com.ecothread;

import com.ecothread.model.*;
import com.ecothread.service.PdfInvoiceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PdfInvoiceServiceTest {

    @Autowired
    private PdfInvoiceService pdfInvoiceService;

    @Test
    void testPdfGeneration() {
        User donor = new User("Aarav Sharma", "donor@ecothread.org", "pass", "9999999999", Role.ROLE_DONOR, 0);
        Address address = new Address(donor, "42 Richmond Road", "Bengaluru", "Karnataka", "560025", 12.96, 77.60);
        PickupRequest pickup = new PickupRequest(donor, address, LocalDate.now(), "10:00 AM - 01:00 PM", 2, "Cotton Shirts, Jackets");
        pickup.setId(101L);

        DonationInvoice invoice = new DonationInvoice(pickup, donor, "ECO-80G-2026-TEST", 15, 54.0, 40500.0);
        invoice.setId(201L);

        byte[] pdfBytes = pdfInvoiceService.generate80GReceiptPdf(invoice);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 500, "PDF byte array should be larger than 500 bytes");
        // Verify PDF Magic Bytes %PDF
        assertEquals('%', (char) pdfBytes[0]);
        assertEquals('P', (char) pdfBytes[1]);
        assertEquals('D', (char) pdfBytes[2]);
        assertEquals('F', (char) pdfBytes[3]);
    }
}
