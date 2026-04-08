package com.greenx.farmapi.model;

/**
 * Canonical role enum for GreenX users.
 *
 * String values stored in the DB (USERS.ROLE column) are the enum names.
 * Spring Security authority names are prefixed with "ROLE_" automatically
 * by the User entity's getAuthorities() implementation.
 */
public enum UserRole {

    /** Platform / cluster administrator */
    ADMIN,

    /** Soil / crop expert */
    EXPERT,

    /** Field operations manager */
    FIELD_MANAGER,

    /** On-ground worker */
    WORKER,

    /** Land / farm owner */
    LANDOWNER;

    /**
     * Resolve a raw role string (from DB or JWT) to a UserRole, tolerating
     * legacy spellings such as CLUSTER_ADMIN, LAND_OWNER, FIELDMANAGER, etc.
     */
    public static UserRole fromString(String raw) {
        if (raw == null) return LANDOWNER;
        String normalised = raw.toUpperCase()
                .replace("-", "_")
                .replace(" ", "_");
        switch (normalised) {
            case "ADMIN":
            case "CLUSTER_ADMIN":
                return ADMIN;
            case "EXPERT":
                return EXPERT;
            case "FIELD_MANAGER":
            case "FIELDMANAGER":
                return FIELD_MANAGER;
            case "WORKER":
                return WORKER;
            case "LANDOWNER":
            case "LAND_OWNER":
                return LANDOWNER;
            default:
                return LANDOWNER;
        }
    }

    /** Returns the Spring Security authority string (without ROLE_ prefix). */
    public String authority() {
        return name();
    }
}
