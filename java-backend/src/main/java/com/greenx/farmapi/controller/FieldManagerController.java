package com.greenx.farmapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import com.greenx.farmapi.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/fieldmanager")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FIELD_MANAGER')")
public class FieldManagerController {

    private final FieldManagerService fieldManagerService;
    private final FarmRepository farmRepository;
    private final FieldOperationRepository fieldOperationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final CalendarTaskRepository calendarTaskRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @GetMapping("/farms")
    public ApiResponse<List<Farm>> getAssignedFarms(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(farmRepository.findByFieldManagerId(user.getId()));
    }

    @GetMapping("/tasks/today")
    public ApiResponse<List<CalendarTask>> getTodayTasks(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(fieldManagerService.getTodayTasks(user.getId()));
    }

    @GetMapping("/tasks")
    public ApiResponse<List<CalendarTask>> getTasks(
            @RequestParam(required = false) String farmId,
            @RequestParam(required = false) String status,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Farm> farms = farmRepository.findByFieldManagerId(user.getId());
        List<CalendarTask> tasks = new ArrayList<>();

        for (Farm f : farms) {
            if (farmId != null && !farmId.equals(f.getId()))
                continue;
            if (status != null) {
                tasks.addAll(calendarTaskRepository.findByFarmIdAndStatus(f.getId(), status));
            } else {
                tasks.addAll(calendarTaskRepository.findByFarmId(f.getId()));
            }
        }
        return ApiResponse.success(tasks);
    }

    @PutMapping("/tasks/{id}/status")
    public ApiResponse<CalendarTask> updateTaskStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        try {
            return ApiResponse.success(
                    fieldManagerService.updateTaskStatus(id, body.get("status"), body.get("notes")));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping(value = "/operations", consumes = { "multipart/form-data" })
    public ApiResponse<FieldOperation> logOperation(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            FieldOperation op = objectMapper.readValue(dataJson, FieldOperation.class);
            op.setFieldManagerId(user.getId());
            return ApiResponse.success(fieldManagerService.logOperation(op, photos));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping(value = "/operations", consumes = { "application/json" })
    public ApiResponse<FieldOperation> logOperationJson(
            @RequestBody FieldOperation op,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            op.setFieldManagerId(user.getId());
            return ApiResponse.success(fieldManagerService.logOperation(op, null));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/operations")
    public ApiResponse<List<FieldOperation>> getOperations(
            @RequestParam(required = false) String farmId,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        if (farmId != null) {
            return ApiResponse.success(fieldOperationRepository.findByFarmIdOrderByOperationDateDesc(farmId));
        }
        return ApiResponse.success(fieldOperationRepository.findByFieldManagerId(user.getId()));
    }

    @PostMapping(value = "/samples", consumes = { "multipart/form-data" })
    public ApiResponse<SoilSample> logSampleCollection(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            SoilSample sample = objectMapper.readValue(dataJson, SoilSample.class);
            sample.setCollectedBy(user.getId());
            return ApiResponse.success(fieldManagerService.logSampleCollection(sample, photos));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping(value = "/pest-alerts", consumes = { "multipart/form-data" })
    public ApiResponse<PestAlert> reportPest(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            PestAlert alert = objectMapper.readValue(dataJson, PestAlert.class);
            alert.setReportedBy(user.getId());
            return ApiResponse.success(fieldManagerService.reportPest(alert, photos));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping(value = "/pest-alerts", consumes = { "application/json" })
    public ApiResponse<PestAlert> reportPestJson(@RequestBody PestAlert alert, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            alert.setReportedBy(user.getId());
            return ApiResponse.success(fieldManagerService.reportPest(alert, null));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/prescriptions")
    public ApiResponse<List<Prescription>> getPrescriptions(Authentication auth) {
        User user = (User) auth.getPrincipal();
        // Get farms assigned to this manager
        List<Farm> farms = farmRepository.findByFieldManagerId(user.getId());
        return ApiResponse.success(prescriptionRepository.findByIsAcknowledgedFalse());
    }

    @PutMapping("/prescriptions/{id}/acknowledge")
    public ApiResponse<Prescription> acknowledgePrescription(
            @PathVariable String id, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(fieldManagerService.acknowledgePrescription(id, user.getId()));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(fieldManagerService.getStats(user.getId()));
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
