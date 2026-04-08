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
@RequestMapping("/landowner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LAND_OWNER') or hasRole('LANDOWNER')")
public class LandOwnerController {

    private final LandOwnerService landOwnerService;
    private final CropCalendarRepository cropCalendarRepository;
    private final CalendarTaskRepository calendarTaskRepository;
    private final FarmRepository farmRepository;
    private final SoilSampleRepository soilSampleRepository;
    private final NotificationService notificationService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Map<String, Object> result = new java.util.HashMap<>(landOwnerService.getStats(user.getId()));
        result.put("role", "LANDOWNER");
        result.put("message", "Welcome to the GreenX Land Owner Dashboard");
        return ApiResponse.success(result);
    }

    @GetMapping("/farms")
    public ApiResponse<List<Farm>> myFarms(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(landOwnerService.getFarmsForOwner(user.getId()));
    }

    @GetMapping("/soil-reports")
    public ApiResponse<List<SoilReport>> getSoilReports(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(landOwnerService.getSoilReports(user.getId()));
    }

    @GetMapping("/crop-suggestions")
    public ApiResponse<List<CropSuggestion>> getCropSuggestions(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(landOwnerService.getCropSuggestions(user.getId()));
    }

    @PostMapping("/crop-suggestions/{id}/select")
    public ApiResponse<CropSuggestion> selectCrop(@PathVariable String id, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(landOwnerService.selectCrop(id, user.getId()));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/calendars")
    public ApiResponse<List<CropCalendar>> getCalendars(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Farm> farms = farmRepository.findByOwnerId(user.getId());
        List<CropCalendar> cals = new ArrayList<>();
        farms.forEach(f -> cals.addAll(cropCalendarRepository.findByFarmIdAndStatus(f.getId(), "PUBLISHED")));
        return ApiResponse.success(cals);
    }

    @GetMapping("/calendar-tasks")
    public ApiResponse<List<CalendarTask>> getCalendarTasks(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Farm> farms = farmRepository.findByOwnerId(user.getId());
        List<CalendarTask> tasks = new ArrayList<>();
        farms.forEach(f -> tasks.addAll(calendarTaskRepository.findByFarmId(f.getId())));
        return ApiResponse.success(tasks);
    }

    @GetMapping("/operations")
    public ApiResponse<List<FieldOperation>> getOperationsFeed(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(landOwnerService.getOperationsFeed(user.getId()));
    }

    @GetMapping("/samples")
    public ApiResponse<List<SoilSample>> getSamples(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Farm> farms = farmRepository.findByOwnerId(user.getId());
        List<String> farmIds = farms.stream().map(Farm::getId).toList();
        if (farmIds.isEmpty()) {
            return ApiResponse.success(List.of());
        }
        List<SoilSample> samples = soilSampleRepository.findByFarmIdIn(farmIds);
        samples.sort((a, b) -> {
            java.time.LocalDateTime ad = a.getCreatedAt();
            java.time.LocalDateTime bd = b.getCreatedAt();
            if (ad == null && bd == null)
                return 0;
            if (ad == null)
                return 1;
            if (bd == null)
                return -1;
            return bd.compareTo(ad);
        });
        return ApiResponse.success(samples);
    }

    @GetMapping("/finance/summary")
    public ApiResponse<Map<String, Object>> getFinanceSummary(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(landOwnerService.getFinanceSummary(user.getId()));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(landOwnerService.getStats(user.getId()));
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
