package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import com.greenx.farmapi.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLUSTER_ADMIN')")
public class ClusterAdminController {

    private final ClusterAdminService adminService;
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final SoilSampleRepository soilSampleRepository;
    private final PestAlertRepository pestAlertRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(adminService.getStats(user.getClusterId()));
    }

    @GetMapping("/farms")
    public ApiResponse<List<Farm>> getFarms(
            @RequestParam(required = false) String status,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Farm> farms = user.getClusterId() != null
                ? farmRepository.findByClusterId(user.getClusterId())
                : farmRepository.findAll();
        if (status != null && !status.isBlank()) {
            farms = farms.stream().filter(f -> status.equalsIgnoreCase(f.getStatus())).toList();
        }
        return ApiResponse.success(farms);
    }

    @GetMapping("/farms/unassigned")
    public ApiResponse<List<Farm>> getUnassignedFarms() {
        return ApiResponse.success(farmRepository.findUnassignedFarms());
    }

    @PostMapping("/farms/assign-manager")
    public ApiResponse<Farm> assignManager(@RequestBody Map<String, String> body) {
        String farmId = body.get("farmId");
        String managerId = body.get("managerId");
        if (farmId == null || managerId == null) {
            return ApiResponse.error("farmId and managerId are required");
        }
        try {
            return ApiResponse.success(adminService.assignFieldManager(farmId, managerId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/farms/assign-expert")
    public ApiResponse<Farm> assignExpert(@RequestBody Map<String, String> body) {
        String farmId = body.get("farmId");
        String expertId = body.get("expertId");
        if (farmId == null || expertId == null) {
            return ApiResponse.error("farmId and expertId are required");
        }
        try {
            return ApiResponse.success(adminService.assignExpert(farmId, expertId));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/managers/available")
    public ApiResponse<List<User>> getAvailableManagers(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<User> managers = user.getClusterId() != null
                ? userRepository.findByRoleFlexibleAndClusterId("FIELD_MANAGER", user.getClusterId())
                : userRepository.findByRoleFlexible("FIELD_MANAGER");
        return ApiResponse.success(managers);
    }

    @GetMapping("/experts")
    public ApiResponse<List<User>> getExperts(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<User> experts = user.getClusterId() != null
                ? userRepository.findByRoleFlexibleAndClusterId("EXPERT", user.getClusterId())
                : userRepository.findByRoleFlexible("EXPERT");
        return ApiResponse.success(experts);
    }

    @PostMapping("/samples/receive")
    public ApiResponse<SoilSample> receiveSample(@RequestBody Map<String, Object> body) {
        try {
            String farmId = (String) body.get("farmId");
            String collectedBy = (String) body.get("collectedBy");
            String expertId = (String) body.get("assignedExpertId");
            Integer numPoints = body.get("numPoints") instanceof Number n ? n.intValue() : null;
            String priority = (String) body.get("priority");
            return ApiResponse
                    .success(adminService.receiveSoilSample(farmId, collectedBy, expertId, numPoints, priority));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/samples/pending")
    public ApiResponse<List<SoilSample>> getPendingSamples() {
        List<SoilSample> samples = new ArrayList<>(soilSampleRepository.findByStatus("COLLECTED"));
        samples.addAll(soilSampleRepository.findByStatus("AT_LAB"));
        samples.addAll(soilSampleRepository.findByStatus("TESTING"));
        return ApiResponse.success(samples);
    }

    @GetMapping("/alerts")
    public ApiResponse<List<PestAlert>> getAllAlerts() {
        return ApiResponse.success(pestAlertRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/users")
    public ApiResponse<List<com.greenx.farmapi.dto.UserDto>> getAllUsers(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<User> users = user.getClusterId() != null
                ? userRepository.findByClusterId(user.getClusterId())
                : userRepository.findAll();
        return ApiResponse.success(users.stream()
                .map(com.greenx.farmapi.dto.UserDto::fromEntity)
                .toList());
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Notification>> getNotifications(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(notificationService.getAll(user.getId()));
    }

    @PutMapping("/notifications/{id}/read")
    public ApiResponse<Notification> markRead(@PathVariable String id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(notificationService.markRead(id, user.getId()));
    }

    @GetMapping("/notifications/unread-count")
    public ApiResponse<Long> unreadCount(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(notificationService.countUnread(user.getId()));
    }

    // ─── Farm Registration (admin registers on behalf of farmer) ─────────────
    @PostMapping("/farms/register")
    public ApiResponse<Map<String, String>> registerFarm(
            @RequestParam("full_name") String fullName,
            @RequestParam("mobile") String mobile,
            @RequestParam("email") String email,
            @RequestParam(value = "aadhaar", required = false) String aadhaar,
            @RequestParam(value = "pan", required = false) String pan,
            @RequestParam(value = "dob", required = false) String dob,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "occupation", required = false) String occupation,
            @RequestParam("village") String village,
            @RequestParam(value = "mandal", required = false) String mandal,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "pincode", required = false) String pincode,
            @RequestParam(value = "landmark", required = false) String landmark,
            @RequestParam(value = "survey_number", required = false) String surveyNumber,
            @RequestParam(value = "total_area", required = false) String totalArea,
            @RequestParam(value = "cultivable_area", required = false) String cultivableArea,
            @RequestParam(value = "soil_type", required = false) String soilType,
            @RequestParam(value = "topography", required = false) String topography,
            @RequestParam(value = "land_ownership", required = false) String landOwnership,
            @RequestParam(value = "previous_crop", required = false) String previousCrop,
            @RequestParam(value = "years_cultivated", required = false) String yearsCultivated,
            @RequestParam(value = "water_source", required = false) String waterSource,
            @RequestParam(value = "irrigation_method", required = false) String irrigationMethod,
            @RequestParam(value = "borewell_depth", required = false) String borewellDepth,
            @RequestParam(value = "electricity", required = false) String electricity,
            @RequestParam(value = "road_access", required = false) String roadAccess,
            @RequestParam(value = "storage_available", required = false) String storageAvailable,
            @RequestParam(value = "fencing", required = false) String fencing,
            @RequestParam(value = "distance_to_market", required = false) String distanceToMarket,
            @RequestParam(value = "account_holder", required = false) String accountHolder,
            @RequestParam(value = "bank_name", required = false) String bankName,
            @RequestParam(value = "branch_name", required = false) String branchName,
            @RequestParam(value = "account_number", required = false) String accountNumber,
            @RequestParam(value = "ifsc_code", required = false) String ifscCode,
            @RequestParam(value = "account_type", required = false) String accountType,
            @RequestParam(value = "upi_id", required = false) String upiId,
            @RequestParam(value = "aadhaar_doc", required = false) MultipartFile aadhaarDoc,
            @RequestParam(value = "passbook_doc", required = false) MultipartFile passbookDoc,
            @RequestParam(value = "profile_photo", required = false) MultipartFile profilePhoto,
            @RequestParam(value = "land_doc", required = false) MultipartFile landDoc,
            Authentication auth) {
        try {
            User adminUser = (User) auth.getPrincipal();

            // 1. Create landowner user account
            if (userRepository.existsByEmail(email)) {
                return ApiResponse.error("User with email " + email + " already exists");
            }
            String tempPassword = mobile + "@GreenX";
            User owner = User.builder()
                    .email(email)
                    .uid(generateUniqueUid())
                    .passwordHash(passwordEncoder.encode(tempPassword))
                    .name(fullName)
                    .phone(mobile)
                    .role("LAND_OWNER")
                    .clusterId(adminUser.getClusterId())
                    .isActive(true)
                    .build();
            owner = userRepository.save(owner);

            // 2. Create farm record
            Double area = null;
            try {
                if (totalArea != null)
                    area = Double.parseDouble(totalArea);
            } catch (NumberFormatException ignored) {
            }

            String contractInfo = String.join(" | ",
                    "Survey: " + (surveyNumber != null ? surveyNumber : ""),
                    "Ownership: " + (landOwnership != null ? landOwnership : ""),
                    "Irrigation: " + (irrigationMethod != null ? irrigationMethod : ""),
                    "Road: " + (roadAccess != null ? roadAccess : ""),
                    "Electricity: " + (electricity != null ? electricity : ""),
                    "Bank: " + (bankName != null ? bankName : "") + " / " + (ifscCode != null ? ifscCode : ""));

            Farm farm = Farm.builder()
                    .ownerId(owner.getId())
                    .clusterId(adminUser.getClusterId())
                    .name(fullName + " Farm")
                    .village(village)
                    .district(district)
                    .state(state != null ? state : "Andhra Pradesh")
                    .pincode(pincode)
                    .totalLand(area)
                    .soilType(soilType)
                    .waterSource(waterSource)
                    .currentCrop(previousCrop)
                    .profitShare(80.0)
                    .contractSummary(contractInfo)
                    .createdBy(adminUser.getId())
                    .status("REGISTERED")
                    .build();
            farm = farmRepository.save(farm);

            // 3. Save uploaded documents
            if (profilePhoto != null && !profilePhoto.isEmpty()) {
                String photoPath = fileStorageService.saveFile(profilePhoto, "profiles", owner.getId());
                owner.setProfilePhoto(photoPath);
                userRepository.save(owner);
            }
            if (aadhaarDoc != null && !aadhaarDoc.isEmpty()) {
                fileStorageService.saveFile(aadhaarDoc, "documents", farm.getId());
            }
            if (passbookDoc != null && !passbookDoc.isEmpty()) {
                fileStorageService.saveFile(passbookDoc, "documents", farm.getId());
            }
            if (landDoc != null && !landDoc.isEmpty()) {
                fileStorageService.saveFile(landDoc, "documents", farm.getId());
            }

            Map<String, String> result = new LinkedHashMap<>();
            result.put("farmId", farm.getId());
            result.put("farmCode", farm.getFarmCode());
            result.put("ownerId", owner.getId());
            result.put("ownerUid", owner.getUid());
            result.put("ownerEmail", owner.getEmail());
            result.put("tempPassword", tempPassword);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Registration failed: " + e.getMessage());
        }
    }

    private String generateUniqueUid() {
        for (int i = 0; i < 10000; i++) {
            String uid = String.format("%04d", ThreadLocalRandom.current().nextInt(0, 10000));
            if (!userRepository.existsByUid(uid)) {
                return uid;
            }
        }
        throw new RuntimeException("Unable to generate unique 4-digit UID");
    }
}
