package com.greenx.farmapi.service;

import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FieldManagerService {

    private final FarmRepository farmRepository;
    private final FieldOperationRepository fieldOperationRepository;
    private final SoilSampleRepository soilSampleRepository;
    private final PestAlertRepository pestAlertRepository;
    private final CalendarTaskRepository calendarTaskRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    @Transactional
    public FieldOperation logOperation(FieldOperation operation, List<MultipartFile> photos) throws IOException {
        // Save photos
        if (photos != null && !photos.isEmpty()) {
            List<String> paths = fileStorageService.saveFiles(photos, "operations", operation.getFarmId());
            operation.setPhotos(String.join(",", paths));
        }
        final FieldOperation savedOperation = fieldOperationRepository.save(operation);

        // Update linked task if provided
        if (savedOperation.getTaskId() != null) {
            calendarTaskRepository.findById(savedOperation.getTaskId()).ifPresent(task -> {
                task.setStatus("COMPLETED");
                task.setCompletedAt(LocalDateTime.now());
                calendarTaskRepository.save(task);
            });
        }

        // Notify land owner
        farmRepository.findById(savedOperation.getFarmId()).ifPresent(farm -> {
            notificationService.notify(farm.getOwnerId(), savedOperation.getFieldManagerId(), "FIELD_MANAGER",
                    "Field Update: " + savedOperation.getOperationType(),
                    "Field update: " + savedOperation.getOperationType() + " done on your farm " + farm.getFarmCode(),
                    "INFO", farm.getId(), "FIELD_OPERATION", savedOperation.getId());
        });

        return savedOperation;
    }

    @Transactional
    public SoilSample logSampleCollection(SoilSample sample, List<MultipartFile> photos) throws IOException {
        if (photos != null && !photos.isEmpty()) {
            List<String> paths = fileStorageService.saveFiles(photos, "samples", sample.getFarmId());
            if (!paths.isEmpty())
                sample.setCollectionNotes(
                        (sample.getCollectionNotes() != null ? sample.getCollectionNotes() + " " : "") +
                                "Photos: " + String.join(",", paths));
        }
        // Auto-assign expertId from the farm if the sample doesn't have one
        farmRepository.findById(sample.getFarmId()).ifPresent(farm -> {
            if ((sample.getAssignedExpertId() == null || sample.getAssignedExpertId().isBlank())
                    && farm.getExpertId() != null && !farm.getExpertId().isBlank()) {
                sample.setAssignedExpertId(farm.getExpertId());
            }
        });

        final SoilSample savedSample = soilSampleRepository.save(sample);

        farmRepository.findById(savedSample.getFarmId()).ifPresent(farm -> {
            // Notify cluster admins
            if (farm.getClusterId() != null) {
                List<User> admins = userRepository.findByRoleAndClusterId("CLUSTER_ADMIN", farm.getClusterId());
                for (User admin : admins) {
                    notificationService.notify(admin.getId(), savedSample.getCollectedBy(), "FIELD_MANAGER",
                            "New Soil Sample Collected",
                            "Soil sample collected on farm " + farm.getFarmCode() + ". Review and assign to expert.",
                            "INFO", farm.getId(), "SOIL_SAMPLE", savedSample.getId());
                }
            }
            // Also notify the assigned expert if set
            if (savedSample.getAssignedExpertId() != null && !savedSample.getAssignedExpertId().isBlank()) {
                notificationService.notify(savedSample.getAssignedExpertId(), savedSample.getCollectedBy(),
                        "FIELD_MANAGER",
                        "New Soil Sample Assigned to You",
                        "A soil sample from farm " + farm.getFarmCode() + " has been submitted for testing.",
                        "INFO", farm.getId(), "SOIL_SAMPLE", savedSample.getId());
            }
            // Notify land owner
            notificationService.notify(farm.getOwnerId(), savedSample.getCollectedBy(), "FIELD_MANAGER",
                    "Soil Sampling Started",
                    "Soil sampling is in progress on your farm " + farm.getFarmCode(),
                    "INFO", farm.getId(), "SOIL_SAMPLE", savedSample.getId());
        });

        return savedSample;
    }

    @Transactional
    public PestAlert reportPest(PestAlert alert, List<MultipartFile> photos) throws IOException {
        if (photos != null && !photos.isEmpty()) {
            List<String> paths = fileStorageService.saveFiles(photos, "pest-alerts", alert.getFarmId());
            alert.setPhotos(String.join(",", paths));
        }
        final PestAlert savedAlert = pestAlertRepository.save(alert);

        farmRepository.findById(savedAlert.getFarmId()).ifPresent(farm -> {
            String msg = "URGENT: " + savedAlert.getPestName() + " (" + savedAlert.getSeverity() + ") reported on Farm "
                    + farm.getFarmCode();

            // Notify expert — if farm has assigned expert via soil sample
            soilSampleRepository.findByFarmId(farm.getId()).stream()
                    .filter(s -> s.getAssignedExpertId() != null)
                    .findFirst()
                    .ifPresent(s -> {
                        notificationService.notify(s.getAssignedExpertId(), savedAlert.getReportedBy(), "FIELD_MANAGER",
                                "URGENT: Pest Alert",
                                msg,
                                "URGENT", farm.getId(), "PEST_ALERT", savedAlert.getId());
                    });

            notificationService.notify(farm.getOwnerId(), savedAlert.getReportedBy(), "FIELD_MANAGER",
                    "Pest Alert on Your Farm",
                    savedAlert.getPestName() + " detected on your farm. Expert has been notified.",
                    "ALERT", farm.getId(), "PEST_ALERT", savedAlert.getId());
        });

        return savedAlert;
    }

    @Transactional
    public CalendarTask updateTaskStatus(String taskId, String status, String notes) {
        CalendarTask task = calendarTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.setStatus(status);
        if ("IN_PROGRESS".equals(status))
            task.setStartedAt(LocalDateTime.now());
        if ("COMPLETED".equals(status)) {
            task.setCompletedAt(LocalDateTime.now());
            if (notes != null)
                task.setCompletionNotes(notes);
        }
        return calendarTaskRepository.save(task);
    }

    public List<CalendarTask> getTodayTasks(String fieldManagerId) {
        List<Farm> farms = farmRepository.findByFieldManagerId(fieldManagerId);
        List<String> farmIds = farms.stream().map(Farm::getId).collect(Collectors.toList());
        if (farmIds.isEmpty())
            return List.of();
        return calendarTaskRepository.findTodayTasksForFarms(farmIds, LocalDate.now());
    }

    @Transactional
    public Prescription acknowledgePrescription(String prescriptionId, String fieldManagerId) {
        Prescription p = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + prescriptionId));
        p.setAcknowledged(true);
        p.setAcknowledgedAt(LocalDateTime.now());
        return prescriptionRepository.save(p);
    }

    public Map<String, Object> getStats(String fieldManagerId) {
        List<Farm> farms = farmRepository.findByFieldManagerId(fieldManagerId);
        List<String> farmIds = farms.stream().map(Farm::getId).collect(Collectors.toList());
        long todayTasks = calendarTaskRepository
                .findTodayTasksForFarms(farmIds, LocalDate.now()).size();
        return Map.of(
                "assignedFarms", farms.size(),
                "todayTasks", todayTasks,
                "openAlerts", farmIds.stream()
                        .mapToLong(fid -> pestAlertRepository.findByFarmIdAndStatus(fid, "OPEN").size())
                        .sum());
    }
}
