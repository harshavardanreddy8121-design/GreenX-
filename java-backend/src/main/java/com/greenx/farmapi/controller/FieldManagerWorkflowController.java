package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.Farm;
import com.greenx.farmapi.entity.FieldOperation;
import com.greenx.farmapi.entity.SoilSample;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.FarmRepository;
import com.greenx.farmapi.repository.FieldOperationRepository;
import com.greenx.farmapi.service.FieldManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fieldmanager/workflow")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FIELD_MANAGER')")
public class FieldManagerWorkflowController {

    private final FieldManagerService fieldManagerService;
    private final FarmRepository farmRepository;
    private final FieldOperationRepository fieldOperationRepository;

    /**
     * Submit a field operation (site visit / activity log) for a farm.
     * The land owner is notified automatically via {@link FieldManagerService#logOperation}.
     */
    @PostMapping("/farms/{farmId}/site-visit")
    public ApiResponse<FieldOperation> submitSiteVisit(
            @PathVariable String farmId,
            @RequestBody FieldOperation operation,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            operation.setFarmId(farmId);
            operation.setFieldManagerId(user.getId());
            FieldOperation saved = fieldManagerService.logOperation(operation, null);
            return ApiResponse.success(saved);
        } catch (Exception e) {
            return ApiResponse.error("Failed to submit site visit: " + e.getMessage());
        }
    }

    /**
     * Submit a field update (any operational activity) for a farm.
     * The land owner is notified automatically via {@link FieldManagerService#logOperation}.
     */
    @PostMapping("/farms/{farmId}/field-update")
    public ApiResponse<FieldOperation> submitFieldUpdate(
            @PathVariable String farmId,
            @RequestBody FieldOperation update,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            update.setFarmId(farmId);
            update.setFieldManagerId(user.getId());
            FieldOperation saved = fieldManagerService.logOperation(update, null);
            return ApiResponse.success(saved);
        } catch (Exception e) {
            return ApiResponse.error("Failed to submit field update: " + e.getMessage());
        }
    }

    /**
     * Retrieve all field operations (updates) logged for a specific farm.
     */
    @GetMapping("/farms/{farmId}/updates")
    public ApiResponse<List<FieldOperation>> getFarmUpdates(@PathVariable String farmId) {
        try {
            return ApiResponse.success(
                    fieldOperationRepository.findByFarmIdOrderByOperationDateDesc(farmId));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving updates: " + e.getMessage());
        }
    }

    /**
     * Submit a soil sample collection record for a farm.
     * The assigned expert and land owner are notified automatically via
     * {@link FieldManagerService#logSampleCollection}.
     */
    @PostMapping("/farms/{farmId}/soil-sample")
    public ApiResponse<SoilSample> submitSoilSample(
            @PathVariable String farmId,
            @RequestBody SoilSample sample,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            sample.setFarmId(farmId);
            sample.setCollectedBy(user.getId());
            SoilSample saved = fieldManagerService.logSampleCollection(sample, null);
            return ApiResponse.success(saved);
        } catch (Exception e) {
            return ApiResponse.error("Failed to submit soil sample: " + e.getMessage());
        }
    }

    /**
     * List all farms assigned to the authenticated field manager.
     */
    @GetMapping("/farms")
    public ApiResponse<List<Farm>> getAssignedFarms(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(farmRepository.findByFieldManagerId(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving farms: " + e.getMessage());
        }
    }
}
