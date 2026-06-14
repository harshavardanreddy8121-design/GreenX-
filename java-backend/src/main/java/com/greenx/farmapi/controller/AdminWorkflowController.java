package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.Farm;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.FarmRepository;
import com.greenx.farmapi.service.ClusterAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/workflow")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('CLUSTER_ADMIN')")
public class AdminWorkflowController {

    private final FarmRepository farmRepository;
    private final ClusterAdminService clusterAdminService;

    /**
     * List all farms with PENDING status awaiting admin review and assignment.
     */
    @GetMapping("/farms/pending-review")
    public ApiResponse<List<Farm>> getPendingReviewFarms() {
        try {
            return ApiResponse.success(farmRepository.findByStatus("PENDING"));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving farms: " + e.getMessage());
        }
    }

    /**
     * Allocate a farm to a field manager and/or expert.
     * Accepts a JSON body with optional {@code fieldManagerId} and {@code expertId}.
     * Each assignment triggers notifications to the assignee and the land owner.
     */
    @PostMapping("/farms/{farmId}/allocate")
    public ApiResponse<Farm> allocateFarm(
            @PathVariable String farmId,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            Farm farm = farmRepository.findById(farmId).orElse(null);
            if (farm == null) {
                return ApiResponse.error("Farm not found");
            }

            String fieldManagerId = request.get("fieldManagerId");
            String expertId = request.get("expertId");

            if (fieldManagerId != null && !fieldManagerId.isBlank()) {
                farm = clusterAdminService.assignFieldManager(farmId, fieldManagerId);
            }
            if (expertId != null && !expertId.isBlank()) {
                farm = clusterAdminService.assignExpert(farmId, expertId);
            }

            return ApiResponse.success(farm);
        } catch (Exception e) {
            return ApiResponse.error("Failed to allocate farm: " + e.getMessage());
        }
    }

    /**
     * Retrieve full details of any farm by ID (admin-level access).
     */
    @GetMapping("/farms/{farmId}/details")
    public ApiResponse<Farm> getFarmDetails(@PathVariable String farmId) {
        try {
            Farm farm = farmRepository.findById(farmId).orElse(null);
            if (farm == null) {
                return ApiResponse.error("Farm not found");
            }
            return ApiResponse.success(farm);
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving farm: " + e.getMessage());
        }
    }

    /**
     * List all farms, optionally filtered by status.
     */
    @GetMapping("/farms")
    public ApiResponse<List<Farm>> getFarms(
            @RequestParam(required = false) String status,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<Farm> farms = user.getClusterId() != null
                    ? farmRepository.findByClusterId(user.getClusterId())
                    : farmRepository.findAll();
            if (status != null && !status.isBlank()) {
                farms = farms.stream()
                        .filter(f -> status.equalsIgnoreCase(f.getStatus()))
                        .toList();
            }
            return ApiResponse.success(farms);
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving farms: " + e.getMessage());
        }
    }
}
