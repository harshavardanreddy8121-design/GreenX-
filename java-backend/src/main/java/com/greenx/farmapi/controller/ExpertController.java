package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import com.greenx.farmapi.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/expert")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EXPERT')")
public class ExpertController {

    private final ExpertService expertService;
    private final SoilReportRepository soilReportRepository;
    private final CropSuggestionRepository cropSuggestionRepository;
    private final CropCalendarRepository cropCalendarRepository;
    private final CalendarTaskRepository calendarTaskRepository;
    private final PestAlertRepository pestAlertRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final FarmRepository farmRepository;
    private final NotificationService notificationService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Map<String, Object> result = new java.util.HashMap<>(expertService.getStats(user.getId()));
        result.put("role", "EXPERT");
        result.put("message", "Welcome to the GreenX Expert Dashboard");
        return ApiResponse.success(result);
    }

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

    @PostMapping("/calendars")
    public ApiResponse<CropCalendar> createCalendar(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            CropCalendar cal = CropCalendar.builder()
                    .farmId((String) body.get("farmId"))
                    .expertId(user.getId())
                    .cropName((String) body.get("cropName"))
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
