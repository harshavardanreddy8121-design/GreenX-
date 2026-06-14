package com.greenx.farmapi.service;

import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FarmWorkflowService {

    private final FarmRepository farmRepository;
    private final SoilReportRepository soilReportRepository;
    private final SoilSampleRepository soilSampleRepository;
    private final CropSuggestionRepository cropSuggestionRepository;
    private final CropCalendarRepository cropCalendarRepository;
    private final CalendarTaskRepository calendarTaskRepository;
    private final FieldOperationRepository fieldOperationRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // Step 1 – Register a farm (landowner)
    // -------------------------------------------------------------------------
    @Transactional
    public Farm registerFarm(Farm farm, String landownerId) {
        farm.setOwnerId(landownerId);
        farm.setStatus("PENDING");
        farm.setCreatedBy(landownerId);
        Farm savedFarm = farmRepository.save(farm);

        // Notify all cluster admins
        List<User> admins = userRepository.findByRoleFlexible("CLUSTER_ADMIN");
        User landowner = userRepository.findById(landownerId).orElse(null);
        String landownerName = landowner != null ? landowner.getName() : "Landowner";

        for (User admin : admins) {
            notificationService.notify(
                    admin.getId(), landownerId, "LAND_OWNER",
                    "New Farm Registration",
                    "New farm registered by " + landownerName + " in " + savedFarm.getVillage(),
                    "INFO", savedFarm.getId(), "FARM", savedFarm.getId());
        }

        return savedFarm;
    }

    // -------------------------------------------------------------------------
    // Step 2 – Allocate farm to field manager + expert (cluster admin)
    // -------------------------------------------------------------------------
    @Transactional
    public Farm allocateFarm(String farmId, String fieldManagerId, String expertId, String adminId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));

        farm.setFieldManagerId(fieldManagerId);
        farm.setExpertId(expertId);
        farm.setStatus("ACTIVE");
        farm = farmRepository.save(farm);

        User fieldManager = userRepository.findById(fieldManagerId).orElse(null);
        User expert = userRepository.findById(expertId).orElse(null);

        if (fieldManager != null) {
            notificationService.notify(
                    fieldManagerId, adminId, "CLUSTER_ADMIN",
                    "Farm Assigned to You",
                    "You have been assigned as field manager for farm " + farm.getFarmCode(),
                    "ACTION_REQUIRED", farmId, "FARM", farmId);
        }

        if (expert != null) {
            notificationService.notify(
                    expertId, adminId, "CLUSTER_ADMIN",
                    "Farm Assigned to You",
                    "You have been assigned as expert for farm " + farm.getFarmCode(),
                    "ACTION_REQUIRED", farmId, "FARM", farmId);
        }

        notificationService.notify(
                farm.getOwnerId(), adminId, "CLUSTER_ADMIN",
                "Farm Assigned to GreenX Team",
                "Your farm " + farm.getFarmCode() + " has been assigned to our professional team",
                "SUCCESS", farmId, "FARM", farmId);

        return farm;
    }

    // -------------------------------------------------------------------------
    // Step 3 – Log soil sample collection (field manager)
    // -------------------------------------------------------------------------
    @Transactional
    public SoilSample logSoilSampleCollection(String farmId, String fieldManagerId, SoilSample sample) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));

        sample.setFarmId(farmId);
        sample.setCollectedBy(fieldManagerId);

        // Auto-assign expert from farm if not set
        if ((sample.getAssignedExpertId() == null || sample.getAssignedExpertId().isBlank())
                && farm.getExpertId() != null) {
            sample.setAssignedExpertId(farm.getExpertId());
        }

        SoilSample savedSample = soilSampleRepository.save(sample);

        // Notify assigned expert
        if (savedSample.getAssignedExpertId() != null) {
            notificationService.notify(
                    savedSample.getAssignedExpertId(), fieldManagerId, "FIELD_MANAGER",
                    "New Soil Sample Assigned",
                    "A soil sample from farm " + farm.getFarmCode() + " has been submitted for testing.",
                    "ACTION_REQUIRED", farmId, "SOIL_SAMPLE", savedSample.getId());
        }

        // Notify landowner
        notificationService.notify(
                farm.getOwnerId(), fieldManagerId, "FIELD_MANAGER",
                "Soil Sampling Started",
                "Soil sampling is in progress on your farm " + farm.getFarmCode(),
                "INFO", farmId, "SOIL_SAMPLE", savedSample.getId());

        return savedSample;
    }

    // -------------------------------------------------------------------------
    // Step 4 – Submit soil test results (expert)
    // -------------------------------------------------------------------------
    @Transactional
    public SoilReport submitSoilTestResults(String farmId, String expertId, SoilReport report) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));

        report.setFarmId(farmId);
        report.setExpertId(expertId);
        SoilReport savedReport = soilReportRepository.save(report);

        // Mark linked sample as completed
        if (savedReport.getSampleId() != null) {
            soilSampleRepository.findById(savedReport.getSampleId()).ifPresent(s -> {
                s.setStatus("COMPLETED");
                soilSampleRepository.save(s);
            });
        }

        String summary = buildSoilSummary(savedReport);

        // Notify landowner
        if (savedReport.isShareLandowner()) {
            notificationService.notify(
                    farm.getOwnerId(), expertId, "EXPERT",
                    "Soil Test Results Available",
                    "Soil test results for your farm " + farm.getFarmCode() + " are now available. " + summary,
                    "SUCCESS", farmId, "SOIL_REPORT", savedReport.getId());
        }

        // Notify field manager
        if (savedReport.isShareFieldmgr() && farm.getFieldManagerId() != null) {
            notificationService.notify(
                    farm.getFieldManagerId(), expertId, "EXPERT",
                    "Soil Test Results Ready",
                    "Soil test results are ready for farm " + farm.getFarmCode() + ". " + summary,
                    "INFO", farmId, "SOIL_REPORT", savedReport.getId());
        }

        // Notify cluster admins
        if (savedReport.isShareCluster() && farm.getClusterId() != null) {
            userRepository.findByRoleAndClusterId("CLUSTER_ADMIN", farm.getClusterId())
                    .forEach(admin -> notificationService.notify(
                            admin.getId(), expertId, "EXPERT",
                            "Soil Test Results Filed",
                            "Soil test completed for farm " + farm.getFarmCode(),
                            "INFO", farmId, "SOIL_REPORT", savedReport.getId()));
        }

        return savedReport;
    }

    // -------------------------------------------------------------------------
    // Step 5 – Submit crop suggestion (expert)
    // -------------------------------------------------------------------------
    @Transactional
    public List<CropSuggestion> submitCropSuggestions(String farmId, String expertId,
            List<CropSuggestion> suggestions) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));

        // Replace existing suggestions for this farm
        cropSuggestionRepository.deleteByFarmId(farmId);

        suggestions.forEach(s -> {
            s.setFarmId(farmId);
            s.setExpertId(expertId);
        });
        List<CropSuggestion> saved = cropSuggestionRepository.saveAll(suggestions);

        // Notify landowner
        notificationService.notify(
                farm.getOwnerId(), expertId, "EXPERT",
                "Crop Suggestions Ready",
                "An expert has suggested crops for your farm " + farm.getFarmCode()
                        + ". Please review and select one to begin your season.",
                "ACTION_REQUIRED", farmId, "CROP_SUGGESTION", null);

        // Notify field manager
        if (farm.getFieldManagerId() != null) {
            notificationService.notify(
                    farm.getFieldManagerId(), expertId, "EXPERT",
                    "Crop Suggestion Submitted",
                    "Expert has submitted crop suggestions for farm " + farm.getFarmCode(),
                    "INFO", farmId, "CROP_SUGGESTION", null);
        }

        // Notify cluster admins
        if (farm.getClusterId() != null) {
            userRepository.findByRoleAndClusterId("CLUSTER_ADMIN", farm.getClusterId())
                    .forEach(admin -> notificationService.notify(
                            admin.getId(), expertId, "EXPERT",
                            "Crop Suggestion Submitted",
                            "Crop suggestion submitted for farm " + farm.getFarmCode(),
                            "INFO", farmId, "CROP_SUGGESTION", null));
        }

        return saved;
    }

    // -------------------------------------------------------------------------
    // Step 6 – Create operations schedule / publish crop calendar (expert)
    // -------------------------------------------------------------------------
    @Transactional
    public CropCalendar createOperationsSchedule(String farmId, String expertId,
            CropCalendar calendar, List<CalendarTask> tasks) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));

        calendar.setFarmId(farmId);
        calendar.setExpertId(expertId);
        calendar.setStatus("PUBLISHED");
        CropCalendar savedCalendar = cropCalendarRepository.save(calendar);

        tasks.forEach(task -> {
            task.setFarmId(farmId);
            task.setCalendarId(savedCalendar.getId());
        });
        calendarTaskRepository.saveAll(tasks);

        // Notify field manager
        if (farm.getFieldManagerId() != null) {
            notificationService.notify(
                    farm.getFieldManagerId(), expertId, "EXPERT",
                    "Season Calendar Published",
                    "Season calendar published for farm " + farm.getFarmCode() + ". Tasks are now live.",
                    "ACTION_REQUIRED", farmId, "CROP_CALENDAR", savedCalendar.getId());
        }

        // Notify landowner
        notificationService.notify(
                farm.getOwnerId(), expertId, "EXPERT",
                "Farming Schedule Created",
                "Your farming schedule for " + calendar.getCropName() + " on farm " + farm.getFarmCode()
                        + " has been created. Season starts " + calendar.getSowingDate(),
                "SUCCESS", farmId, "CROP_CALENDAR", savedCalendar.getId());

        return savedCalendar;
    }

    // -------------------------------------------------------------------------
    // Step 7 – Log field operation / update (field manager)
    // -------------------------------------------------------------------------
    @Transactional
    public FieldOperation submitFieldUpdate(String farmId, String fieldManagerId, FieldOperation operation) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));

        operation.setFarmId(farmId);
        operation.setFieldManagerId(fieldManagerId);
        FieldOperation savedOperation = fieldOperationRepository.save(operation);

        // Mark linked calendar task as completed if provided
        if (savedOperation.getTaskId() != null) {
            calendarTaskRepository.findById(savedOperation.getTaskId()).ifPresent(task -> {
                task.setStatus("COMPLETED");
                task.setCompletedAt(java.time.LocalDateTime.now());
                calendarTaskRepository.save(task);
            });
        }

        // Notify landowner
        notificationService.notify(
                farm.getOwnerId(), fieldManagerId, "FIELD_MANAGER",
                "Field Update: " + savedOperation.getOperationType(),
                "Field update: " + savedOperation.getOperationType() + " completed on your farm "
                        + farm.getFarmCode(),
                "INFO", farmId, "FIELD_OPERATION", savedOperation.getId());

        // Notify expert
        if (farm.getExpertId() != null) {
            notificationService.notify(
                    farm.getExpertId(), fieldManagerId, "FIELD_MANAGER",
                    "Field Update on Farm " + farm.getFarmCode(),
                    savedOperation.getOperationType() + " completed on farm " + farm.getFarmCode(),
                    "INFO", farmId, "FIELD_OPERATION", savedOperation.getId());
        }

        // Notify cluster admins
        if (farm.getClusterId() != null) {
            userRepository.findByRoleAndClusterId("CLUSTER_ADMIN", farm.getClusterId())
                    .forEach(admin -> notificationService.notify(
                            admin.getId(), fieldManagerId, "FIELD_MANAGER",
                            "Field Update on Farm " + farm.getFarmCode(),
                            savedOperation.getOperationType() + " logged for farm " + farm.getFarmCode(),
                            "INFO", farmId, "FIELD_OPERATION", savedOperation.getId()));
        }

        return savedOperation;
    }

    // -------------------------------------------------------------------------
    // Read helpers
    // -------------------------------------------------------------------------

    public List<FieldOperation> getFarmOperations(String farmId) {
        return fieldOperationRepository.findByFarmIdOrderByOperationDateDesc(farmId);
    }

    public List<CalendarTask> getFarmSchedule(String farmId) {
        return calendarTaskRepository.findByFarmId(farmId);
    }

    public List<CropCalendar> getFarmCalendars(String farmId) {
        return cropCalendarRepository.findByFarmId(farmId);
    }

    public List<CropSuggestion> getFarmCropSuggestions(String farmId) {
        return cropSuggestionRepository.findByFarmId(farmId);
    }

    public Optional<SoilReport> getLatestSoilReport(String farmId) {
        return soilReportRepository.findByFarmId(farmId).stream()
                .max(java.util.Comparator.comparing(
                        SoilReport::getCreatedAt,
                        java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())));
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private String buildSoilSummary(SoilReport r) {
        return String.format("pH:%.1f, N:%.0f, P:%.0f, K:%.0f",
                r.getPhLevel() != null ? r.getPhLevel().doubleValue() : 0,
                r.getNitrogenKgHa() != null ? r.getNitrogenKgHa().doubleValue() : 0,
                r.getPhosphorusKgHa() != null ? r.getPhosphorusKgHa().doubleValue() : 0,
                r.getPotassiumKgHa() != null ? r.getPotassiumKgHa().doubleValue() : 0);
    }
}
