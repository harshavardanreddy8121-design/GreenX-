package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.CropCalendar;
import com.greenx.farmapi.entity.CropSuggestion;
import com.greenx.farmapi.entity.SoilReport;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.CropCalendarRepository;
import com.greenx.farmapi.repository.CropSuggestionRepository;
import com.greenx.farmapi.repository.SoilReportRepository;
import com.greenx.farmapi.service.ExpertService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expert/workflow")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EXPERT')")
public class ExpertWorkflowController {

    private final ExpertService expertService;
    private final SoilReportRepository soilReportRepository;
    private final CropSuggestionRepository cropSuggestionRepository;
    private final CropCalendarRepository cropCalendarRepository;

    /**
     * Submit soil test results for a farm.
     * Notifies the land owner, field manager, and cluster admin based on the
     * share flags set on the report (defaults: all true).
     */
    @PostMapping("/farms/{farmId}/soil-test")
    public ApiResponse<SoilReport> submitSoilTestResults(
            @PathVariable String farmId,
            @RequestBody SoilReport report,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            report.setFarmId(farmId);
            report.setExpertId(user.getId());
            SoilReport saved = expertService.uploadSoilReport(report);
            return ApiResponse.success(saved);
        } catch (Exception e) {
            return ApiResponse.error("Failed to submit soil test results: " + e.getMessage());
        }
    }

    /**
     * Submit one or more crop suggestions for a farm.
     * The land owner is notified to review and select a crop.
     */
    @PostMapping("/farms/{farmId}/crop-suggestion")
    public ApiResponse<List<CropSuggestion>> submitCropSuggestions(
            @PathVariable String farmId,
            @RequestBody List<CropSuggestion> suggestions,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            suggestions.forEach(s -> {
                s.setFarmId(farmId);
                s.setExpertId(user.getId());
            });
            return ApiResponse.success(expertService.saveCropSuggestions(suggestions));
        } catch (Exception e) {
            return ApiResponse.error("Failed to submit crop suggestions: " + e.getMessage());
        }
    }

    /**
     * Publish an operations schedule (crop calendar) for a farm.
     * The field manager and land owner are notified when the calendar is published.
     */
    @PostMapping("/farms/{farmId}/schedule")
    public ApiResponse<CropCalendar> publishSchedule(
            @PathVariable String farmId,
            @RequestBody CropCalendar calendar,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            calendar.setFarmId(farmId);
            calendar.setExpertId(user.getId());
            CropCalendar saved = cropCalendarRepository.save(calendar);
            // Publish immediately and trigger notifications
            CropCalendar published = expertService.publishCalendar(saved.getId());
            return ApiResponse.success(published);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create operations schedule: " + e.getMessage());
        }
    }

    /**
     * Retrieve all crop calendars (schedules) for a specific farm.
     */
    @GetMapping("/farms/{farmId}/schedule")
    public ApiResponse<List<CropCalendar>> getFarmSchedule(@PathVariable String farmId) {
        try {
            return ApiResponse.success(cropCalendarRepository.findByFarmIdIn(List.of(farmId)));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving schedule: " + e.getMessage());
        }
    }

    /**
     * Retrieve all crop suggestions submitted for a specific farm.
     */
    @GetMapping("/farms/{farmId}/crop-suggestions")
    public ApiResponse<List<CropSuggestion>> getFarmCropSuggestions(@PathVariable String farmId) {
        try {
            return ApiResponse.success(cropSuggestionRepository.findByFarmId(farmId));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving suggestions: " + e.getMessage());
        }
    }

    /**
     * Retrieve all soil reports submitted for a specific farm.
     */
    @GetMapping("/farms/{farmId}/soil-reports")
    public ApiResponse<List<SoilReport>> getFarmSoilReports(@PathVariable String farmId) {
        try {
            return ApiResponse.success(soilReportRepository.findByFarmId(farmId));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving soil reports: " + e.getMessage());
        }
    }
}
