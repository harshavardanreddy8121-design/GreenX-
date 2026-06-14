package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.Farm;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.FarmRepository;
import com.greenx.farmapi.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/landowner/workflow")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LAND_OWNER') or hasRole('LANDOWNER')")
public class LandOwnerWorkflowController {

    private final FarmRepository farmRepository;
    private final NotificationService notificationService;

    /**
     * Register a new farm for the authenticated land owner.
     * The farm is persisted with status PENDING, awaiting admin review.
     */
    @PostMapping("/farms/register")
    public ApiResponse<Farm> registerFarm(@RequestBody Farm farmRequest, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            farmRequest.setOwnerId(user.getId());
            farmRequest.setStatus("PENDING");
            farmRequest.setCreatedBy(user.getId());
            Farm saved = farmRepository.save(farmRequest);

            // Notify the land owner that their registration is under review
            notificationService.notify(
                    user.getId(), null, "SYSTEM",
                    "Farm Registration Received",
                    "Your farm " + saved.getFarmCode() + " has been registered and is awaiting admin review.",
                    "INFO", saved.getId(), "FARM", saved.getId()
            );

            return ApiResponse.success(saved);
        } catch (Exception e) {
            return ApiResponse.error("Failed to register farm: " + e.getMessage());
        }
    }

    /**
     * Retrieve details of a specific farm owned by the authenticated land owner.
     */
    @GetMapping("/farms/{farmId}")
    public ApiResponse<Farm> getFarmDetails(@PathVariable String farmId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            Farm farm = farmRepository.findById(farmId).orElse(null);

            if (farm == null) {
                return ApiResponse.error("Farm not found");
            }
            if (!farm.getOwnerId().equals(user.getId())) {
                return ApiResponse.error("You don't have access to this farm");
            }

            return ApiResponse.success(farm);
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving farm: " + e.getMessage());
        }
    }

    /**
     * List all farms belonging to the authenticated land owner.
     */
    @GetMapping("/farms")
    public ApiResponse<List<Farm>> getMyFarms(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(farmRepository.findByOwnerId(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving farms: " + e.getMessage());
        }
    }
}
