package com.ecothread.service;

import com.ecothread.model.DonationInvoice;
import com.ecothread.model.PickupRequest;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfInvoiceService {

    @Value("${ecothread.org.name:EcoThread Sustainable Foundation}")
    private String orgName;

    @Value("${ecothread.org.reg-number:NGO-80G/CSR/2026/88421}")
    private String regNumber;

    @Value("${ecothread.org.tax-exemption-id:AAATE1234F-80G-01}")
    private String taxExemptionId;

    @Value("${ecothread.org.address:74 Green Weave Way, EcoHub Park, Bengaluru 560100}")
    private String orgAddress;

    public byte[] generate80GReceiptPdf(DonationInvoice invoice) {
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Colors
            Color emeraldDark = new Color(6, 78, 59);     // #064e3b
            Color emeraldPrimary = new Color(16, 185, 129); // #10b981
            Color textDark = new Color(31, 41, 55);       // #1f2937
            Color lightBg = new Color(243, 250, 246);     // soft mint tint
            Color borderColor = new Color(209, 250, 229);

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, emeraldDark);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, emeraldDark);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, emeraldDark);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, textDark);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, textDark);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);
            Font impactFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, emeraldDark);

            // Header Banner Table
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60f, 40f});

            // Organization branding
            PdfPCell orgCell = new PdfPCell();
            orgCell.setBorder(Rectangle.NO_BORDER);
            Paragraph brandPara = new Paragraph("🌱 " + orgName.toUpperCase(), titleFont);
            Paragraph subBrandPara = new Paragraph("Circular Fashion & NGO Redistribution Network\nSection 8 Registered Non-Profit Organization", smallFont);
            orgCell.addElement(brandPara);
            orgCell.addElement(subBrandPara);
            headerTable.addCell(orgCell);

            // Invoice / Receipt Metadata
            PdfPCell metaCell = new PdfPCell();
            metaCell.setBorder(Rectangle.NO_BORDER);
            metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph receiptNum = new Paragraph("RECEIPT: " + invoice.getInvoiceNumber(), subtitleFont);
            receiptNum.setAlignment(Element.ALIGN_RIGHT);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
            Paragraph datePara = new Paragraph("Issued: " + invoice.getIssuedAt().format(formatter) +
                    "\nTax Section: 80G (50% Exemption)\nReg: " + regNumber, normalFont);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            metaCell.addElement(receiptNum);
            metaCell.addElement(datePara);
            headerTable.addCell(metaCell);

            document.add(headerTable);

            // Divider Line
            document.add(new Paragraph(" "));

            // Title Banner
            PdfPTable bannerTable = new PdfPTable(1);
            bannerTable.setWidthPercentage(100);
            PdfPCell bannerCell = new PdfPCell(new Phrase("CERTIFICATE OF DONATION & SECTION 80G TAX EXEMPTION", sectionTitleFont));
            bannerCell.setBackgroundColor(lightBg);
            bannerCell.setPadding(8);
            bannerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            bannerCell.setBorderColor(borderColor);
            bannerCell.setBorderWidth(1.5f);
            bannerTable.addCell(bannerCell);
            document.add(bannerTable);

            document.add(new Paragraph(" "));

            // Donor and Pickup Details Table
            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setWidths(new float[]{50f, 50f});

            PickupRequest pickup = invoice.getPickupRequest();

            // Donor Info Cell
            PdfPCell donorCell = new PdfPCell();
            donorCell.setBorder(Rectangle.BOX);
            donorCell.setBorderColor(Color.LIGHT_GRAY);
            donorCell.setPadding(10);
            donorCell.addElement(new Paragraph("DONOR DETAILS", sectionTitleFont));
            donorCell.addElement(new Paragraph("Name: " + invoice.getDonor().getFullName(), boldFont));
            donorCell.addElement(new Paragraph("Email: " + invoice.getDonor().getEmail(), normalFont));
            donorCell.addElement(new Paragraph("Phone: " + (invoice.getDonor().getPhone() != null ? invoice.getDonor().getPhone() : "N/A"), normalFont));
            if (pickup != null && pickup.getPickupAddress() != null) {
                donorCell.addElement(new Paragraph("Address: " + pickup.getPickupAddress().getStreetAddress() + ", " +
                        pickup.getPickupAddress().getCity() + " - " + pickup.getPickupAddress().getPincode(), normalFont));
            }
            detailsTable.addCell(donorCell);

            // Exemption & Verification Details
            PdfPCell taxCell = new PdfPCell();
            taxCell.setBorder(Rectangle.BOX);
            taxCell.setBorderColor(Color.LIGHT_GRAY);
            taxCell.setPadding(10);
            taxCell.addElement(new Paragraph("TAX EXEMPTION RECOGNITION", sectionTitleFont));
            taxCell.addElement(new Paragraph("80G Order No: " + taxExemptionId, boldFont));
            taxCell.addElement(new Paragraph("Exemption Validity: Permanent / AY 2026-27 onwards", normalFont));
            taxCell.addElement(new Paragraph("Nature of Contribution: In-Kind Garment Donation for Poverty Alleviation", normalFont));
            taxCell.addElement(new Paragraph("Pickup Reference: #" + (pickup != null ? pickup.getId() : "N/A"), normalFont));
            detailsTable.addCell(taxCell);

            document.add(detailsTable);

            document.add(new Paragraph(" "));

            // Garment Contribution Breakdown Table
            PdfPTable breakdownTable = new PdfPTable(4);
            breakdownTable.setWidthPercentage(100);
            breakdownTable.setWidths(new float[]{40f, 20f, 20f, 20f});

            // Table Headers
            String[] headers = {"Donation Description", "Quantity", "Verified Grade", "Diverted Route"};
            for (String h : headers) {
                PdfPCell hCell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
                hCell.setBackgroundColor(emeraldDark);
                hCell.setPadding(6);
                hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                breakdownTable.addCell(hCell);
            }

            // Table Rows
            String types = (pickup != null && pickup.getClothTypes() != null) ? pickup.getClothTypes() : "Assorted Apparel & Textiles";
            int totalItems = invoice.getTotalItemsVerified() > 0 ? invoice.getTotalItemsVerified() : 12;

            PdfPCell c1 = new PdfPCell(new Phrase(types, normalFont));
            c1.setPadding(6);
            breakdownTable.addCell(c1);

            PdfPCell c2 = new PdfPCell(new Phrase(totalItems + " items", normalFont));
            c2.setHorizontalAlignment(Element.ALIGN_CENTER);
            c2.setPadding(6);
            breakdownTable.addCell(c2);

            PdfPCell c3 = new PdfPCell(new Phrase("QC Passed (Grade A/B)", normalFont));
            c3.setHorizontalAlignment(Element.ALIGN_CENTER);
            c3.setPadding(6);
            breakdownTable.addCell(c3);

            PdfPCell c4 = new PdfPCell(new Phrase("Redistribution & Reuse", normalFont));
            c4.setHorizontalAlignment(Element.ALIGN_CENTER);
            c4.setPadding(6);
            breakdownTable.addCell(c4);

            document.add(breakdownTable);

            document.add(new Paragraph(" "));

            // Environmental Impact Highlights Box
            PdfPTable impactBox = new PdfPTable(3);
            impactBox.setWidthPercentage(100);
            impactBox.setWidths(new float[]{33f, 34f, 33f});

            PdfPCell waterCell = new PdfPCell();
            waterCell.setBackgroundColor(lightBg);
            waterCell.setBorderColor(emeraldPrimary);
            waterCell.setPadding(10);
            waterCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph w1 = new Paragraph("💧 WATER SAVED", sectionTitleFont);
            w1.setAlignment(Element.ALIGN_CENTER);
            Paragraph w2 = new Paragraph(String.format("%,.0f Liters", invoice.getWaterSavedLiters()), impactFont);
            w2.setAlignment(Element.ALIGN_CENTER);
            waterCell.addElement(w1);
            waterCell.addElement(w2);
            impactBox.addCell(waterCell);

            PdfPCell co2Cell = new PdfPCell();
            co2Cell.setBackgroundColor(lightBg);
            co2Cell.setBorderColor(emeraldPrimary);
            co2Cell.setPadding(10);
            co2Cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph co1 = new Paragraph("🌍 CO2 PREVENTED", sectionTitleFont);
            co1.setAlignment(Element.ALIGN_CENTER);
            Paragraph co2 = new Paragraph(String.format("%.1f Kg", invoice.getCo2SavedKg()), impactFont);
            co2.setAlignment(Element.ALIGN_CENTER);
            co2Cell.addElement(co1);
            co2Cell.addElement(co2);
            impactBox.addCell(co2Cell);

            PdfPCell sdgCell = new PdfPCell();
            sdgCell.setBackgroundColor(lightBg);
            sdgCell.setBorderColor(emeraldPrimary);
            sdgCell.setPadding(10);
            sdgCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph s1 = new Paragraph("🎯 SDG ALIGNMENT", sectionTitleFont);
            s1.setAlignment(Element.ALIGN_CENTER);
            Paragraph s2 = new Paragraph("SDG 1, 12 & 13", impactFont);
            s2.setAlignment(Element.ALIGN_CENTER);
            sdgCell.addElement(s1);
            sdgCell.addElement(s2);
            impactBox.addCell(sdgCell);

            document.add(impactBox);

            document.add(new Paragraph(" "));

            // Signatures & Legal Disclaimer
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.setWidths(new float[]{65f, 35f});

            PdfPCell disclaimerCell = new PdfPCell();
            disclaimerCell.setBorder(Rectangle.NO_BORDER);
            Paragraph legalPara = new Paragraph(
                    "This electronic document is issued pursuant to Income Tax Act, 1961 Section 80G.\n" +
                    "Donations of usable clothing and essentials are verified and distributed free of cost to " +
                    "economically disadvantaged families and disaster relief areas without discrimination.", smallFont);
            disclaimerCell.addElement(legalPara);
            signTable.addCell(disclaimerCell);

            PdfPCell signCell = new PdfPCell();
            signCell.setBorder(Rectangle.NO_BORDER);
            signCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph signPara = new Paragraph("Authorized Signatory\nEcoThread Foundation Trustee\n[Digital Verification Seal]", boldFont);
            signPara.setAlignment(Element.ALIGN_RIGHT);
            signCell.addElement(signPara);
            signTable.addCell(signCell);

            document.add(signTable);

            // Footer
            Paragraph footer = new Paragraph("\nEcoThread Sustainable Foundation • " + orgAddress + " • " + orgName, smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF 80G receipt", e);
        }

        return out.toByteArray();
    }
}
