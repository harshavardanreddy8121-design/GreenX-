package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import com.greenx.farmapi.service.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/expert")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EXPERT')")
public class ExpertController {

    private static final Logger log = LoggerFactory.getLogger(ExpertController.class);

    private final ExpertService expertService;
    private final SoilReportRepository soilReportRepository;
    private final SoilSampleRepository soilSampleRepository;
    private final CropSuggestionRepository cropSuggestionRepository;
    private final CropCalendarRepository cropCalendarRepository;
    private final CalendarTaskRepository calendarTaskRepository;
    private final PestAlertRepository pestAlertRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final FarmRepository farmRepository;
    private final NotificationService notificationService;

    @GetMapping("/samples/pending")
    public ApiResponse<List<SoilSample>> getPendingSamples(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(expertService.getPendingSamples(user.getId()));
    }

    @GetMapping("/farms")
    public ApiResponse<List<Farm>> getAssignedFarms(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(farmRepository.findByExpertId(user.getId()));
    }

    @GetMapping("/shared/samples")
    public ApiResponse<List<SoilSample>> getSharedSamples(
            @RequestParam(required = false) String status,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Farm> farms = farmRepository.findByExpertId(user.getId());
        List<String> farmIds = farms.stream().map(Farm::getId).toList();
        if (farmIds.isEmpty()) {
            return ApiResponse.success(List.of());
        }
        List<SoilSample> samples = status != null
                ? soilSampleRepository.findByFarmIdInAndStatus(farmIds, status)
                : soilSampleRepository.findByFarmIdIn(farmIds);
        samples.sort((a, b) -> {
            java.time.LocalDateTime ad = a.getCreatedAt();
            java.time.LocalDateTime bd = b.getCreatedAt();
            if (ad == null && bd == null) return 0;
            if (ad == null) return 1;
            if (bd == null) return -1;
            return bd.compareTo(ad);
        });
        return ApiResponse.success(samples);
    }

    @GetMapping("/shared/soil-reports")
    public ApiResponse<List<SoilReport>> getSharedSoilReports(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Farm> farms = farmRepository.findByExpertId(user.getId());
        List<String> farmIds = farms.stream().map(Farm::getId).toList();
        if (farmIds.isEmpty()) {
            return ApiResponse.success(List.of());
        }
        return ApiResponse.success(soilReportRepository.findByExpertIdAndFarmIdIn(user.getId(), farmIds));
    }

    @GetMapping("/shared/pest-alerts")
    public ApiResponse<List<PestAlert>> getSharedPestAlerts(
            @RequestParam(required = false) String status,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Farm> farms = farmRepository.findByExpertId(user.getId());
        List<String> farmIds = farms.stream().map(Farm::getId).toList();
        if (farmIds.isEmpty()) {
            return ApiResponse.success(List.of());
        }
        return ApiResponse.success(status != null
                ? pestAlertRepository.findByFarmIdInAndStatus(farmIds, status)
                : pestAlertRepository.findByFarmIdIn(farmIds));
    }

    @GetMapping("/shared/prescriptions")
    public ApiResponse<List<Prescription>> getSharedPrescriptions(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Farm> farms = farmRepository.findByExpertId(user.getId());
        List<String> farmIds = farms.stream().map(Farm::getId).toList();
        if (farmIds.isEmpty()) {
            return ApiResponse.success(List.of());
        }
        List<String> alertIds = pestAlertRepository.findByFarmIdIn(farmIds)
                .stream().map(PestAlert::getId).toList();
        if (alertIds.isEmpty()) {
            return ApiResponse.success(List.of());
        }
        return ApiResponse.success(prescriptionRepository.findByAlertIdIn(alertIds));
    }

    @PostMapping("/soil-reports")
    public ApiResponse<SoilReport> submitReport(@RequestBody SoilReport report, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            report.setExpertId(user.getId());
            return ApiResponse.success(expertService.uploadSoilReport(report));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/soil-reports")
    public ApiResponse<List<SoilReport>> getMyReports(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(soilReportRepository.findByExpertId(user.getId()));
    }

    @GetMapping("/farms/{farmId}/reports")
    public ApiResponse<List<SoilReport>> getFarmReports(@PathVariable String farmId) {
        return ApiResponse.success(soilReportRepository.findByFarmId(farmId));
    }

    @PostMapping("/crop-suggestions")
    public ApiResponse<List<CropSuggestion>> saveSuggestions(
            @RequestBody List<CropSuggestion> suggestions, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            suggestions.forEach(s -> s.setExpertId(user.getId()));
            return ApiResponse.success(expertService.saveCropSuggestions(suggestions));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/crop-suggestions")
    public ApiResponse<List<CropSuggestion>> getMySuggestions(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(cropSuggestionRepository.findByExpertId(user.getId()));
    }

    @GetMapping("/farms-awaiting-suggestions")
    public ApiResponse<List<Farm>> farmsAwaitingSuggestions(Authentication auth) {
        // Farms with completed soil reports but no suggestions yet
        return ApiResponse.success(farmRepository.findAll().stream()
                .filter(f -> {
                    boolean hasReport = !soilReportRepository.findByFarmId(f.getId()).isEmpty();
                    boolean hasSuggestion = !cropSuggestionRepository.findByFarmId(f.getId()).isEmpty();
                    return hasReport && !hasSuggestion;
                }).toList());
    }

    @GetMapping("/calendars")
    public ApiResponse<List<CropCalendar>> getMyCalendars(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(cropCalendarRepository.findByExpertId(user.getId()));
    }

    @PostMapping("/calendars")
    public ApiResponse<CropCalendar> createCalendar(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            log.info("createCalendar request body: {}", body);
            User user = (User) auth.getPrincipal();

            // Resolve cropName: prefer explicit field, fall back to linked suggestion
            String cropName = (String) body.get("cropName");
            if (cropName == null || cropName.isBlank()) {
                String suggestionId = (String) body.get("suggestionId");
                if (suggestionId != null && !suggestionId.isBlank()) {
                    cropName = cropSuggestionRepository.findById(suggestionId)
                            .map(CropSuggestion::getCropName)
                            .orElse(null);
                    log.info("cropName resolved from suggestionId {}: {}", suggestionId, cropName);
                }
            }

            if (cropName == null || cropName.isBlank()) {
                log.warn("createCalendar validation failed: cropName is missing. body={}", body);
                return ApiResponse.error("cropName is required to create a crop calendar");
            }

            CropCalendar cal = CropCalendar.builder()
                    .farmId((String) body.get("farmId"))
                    .expertId(user.getId())
                    .cropName(cropName)
                    .season((String) body.get("season"))
                    .suggestionId((String) body.get("suggestionId"))
                    .build();
            if (body.get("sowingDate") != null)
                cal.setSowingDate(java.time.LocalDate.parse((String) body.get("sowingDate")));
            if (body.get("harvestDate") != null)
                cal.setHarvestDate(java.time.LocalDate.parse((String) body.get("harvestDate")));
            cal = cropCalendarRepository.save(cal);

            // Save tasks if provided
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> tasks = (List<Map<String, Object>>) body.get("tasks");
            if (tasks != null) {
                String calId = cal.getId();
                String farmId = cal.getFarmId();
                List<CalendarTask> entities = tasks.stream().map(t -> {
                    CalendarTask task = new CalendarTask();
                    task.setCalendarId(calId);
                    task.setFarmId(farmId);
                    task.setTaskType((String) t.getOrDefault("taskType", "OTHER"));
                    task.setTaskTitle((String) t.getOrDefault("taskTitle", "Task"));
                    task.setTaskDescription((String) t.get("taskDescription"));
                    if (t.get("scheduledDate") != null)
                        task.setScheduledDate(java.time.LocalDate.parse((String) t.get("scheduledDate")));
                    if (t.get("weekNumber") instanceof Number wn)
                        task.setWeekNumber(wn.intValue());
                    task.setProductRecommended((String) t.get("productRecommended"));
                    task.setDoseRecommended((String) t.get("doseRecommended"));
                    return task;
                }).toList();
                calendarTaskRepository.saveAll(entities);
            }
            return ApiResponse.success(cal);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/calendars/{id}/publish")
    public ApiResponse<CropCalendar> publishCalendar(@PathVariable String id) {
        try {
            return ApiResponse.success(expertService.publishCalendar(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/pest-alerts")
    public ApiResponse<List<PestAlert>> getPestAlerts() {
        return ApiResponse.success(pestAlertRepository.findByStatus("OPEN"));
    }

    @PostMapping("/prescriptions")
    public ApiResponse<Prescription> issuePrescription(
            @RequestBody Prescription prescription, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            prescription.setExpertId(user.getId());
            return ApiResponse.success(expertService.issuePrescription(prescription));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/prescriptions")
    public ApiResponse<List<Prescription>> getMyPrescriptions(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(prescriptionRepository.findByExpertId(user.getId()));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(expertService.getStats(user.getId()));
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
}
