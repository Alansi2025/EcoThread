package com.ecothread.model;

public enum ConditionGrade {
    GRADE_A,              // Prime quality -> Redirection to Beneficiary Store Catalog
    GRADE_B,              // Good condition -> Redirection to Bulk NGO Community Drives
    GRADE_C,              // Damaged / Torn -> Industrial Recycling, Downcycling & Insulation
    RECYCLE_DOWNGRADE     // Legacy alias for Grade C
}
