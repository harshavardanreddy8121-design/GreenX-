package com.greenx.farmapi.service;

import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ClusterAdminService {

        private final FarmRepository farmRepository;
        private final com.greenx.farmapi.repository.UserRepository userRepository;
        private final SoilSampleRepository soilSampleRepository;
        private final SoilReportRepository soilReportRepository;
        private final FieldOperationRepository fieldOperationRepository;
        private final CalendarTaskRepository calendarTaskRepository;
        private final PestAlertRepository pestAlertRepository;
        private final PrescriptionRepository prescriptionRepository;
        private final CropSuggestionRepository cropSuggestionRepository;
        private final NotificationService notificationService;

        @Transactional
        public Farm assignFieldManager(String farmId, String managerId) {
                Farm farm = farmRepository.findById(farmId)
                                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));
                User manager = userRepository.findById(managerId)
                                .orElseThrow(() -> new RuntimeException("Manager not found: " + managerId));

                farm.setFieldManagerId(managerId);
                farm.setStatus("ACTIVE");
                farm = farmRepository.save(farm);

                // Notify land owner
                notificationService.notify(farm.getOwnerId(), null, "CLUSTER_ADMIN",
                                "Field Manager Assigned",
                                "Your farm " + farm.getFarmCode() + " is now active. Manager: " + manager.getName(),
                                "SUCCESS", farm.getId(), "FARM", farm.getId());

                // Notify field manager
                notificationService.notify(managerId, null, "CLUSTER_ADMIN",
                                "New Farm Assigned",
                                "You have been assigned to Farm " + farm.getFarmCode(),
                                "INFO", farm.getId(), "FARM", farm.getId());

                return farm;
        }

        @Transactional
        public Farm assignExpert(String farmId, String expertId) {
                Farm farm = farmRepository.findById(farmId)
                                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));
                User expert = userRepository.findById(expertId)
                                .orElseThrow(() -> new RuntimeException("Expert not found: " + expertId));

                farm.setExpertId(expertId);
                farm = farmRepository.save(farm);

                // Notify land owner
                notificationService.notify(farm.getOwnerId(), null, "CLUSTER_ADMIN",
                                "Expert Assigned",
                                "Expert " + expert.getName() + " has been assigned to your farm " + farm.getFarmCode(),
                                "SUCCESS", farm.getId(), "FARM", farm.getId());

                // Notify expert
                notificationService.notify(expertId, null, "CLUSTER_ADMIN",
                                "New Farm Assigned",
                                "You have been assigned as expert to Farm " + farm.getFarmCode(),
                                "INFO", farm.getId(), "FARM", farm.getId());

                // Backfill already collected samples for this farm that were not assigned to
                // any
                // expert yet.
                List<SoilSample> farmSamples = soilSampleRepository.findByFarmId(farmId);
                List<SoilSample> unassigned = farmSamples.stream()
                                .filter(s -> s.getAssignedExpertId() == null || s.getAssignedExpertId().isBlank())
                                .toList();
                if (!unassigned.isEmpty()) {
                        unassigned.forEach(s -> s.setAssignedExpertId(expertId));
                        soilSampleRepository.saveAll(unassigned);

                        notificationService.notify(expertId, null, "CLUSTER_ADMIN",
                                        "Soil Samples Linked",
                                        unassigned.size() + " existing sample(s) from Farm " + farm.getFarmCode()
                                                        + " are now assigned to you.",
                                        "ACTION_REQUIRED", farm.getId(), "SOIL_SAMPLE", unassigned.get(0).getId());
                }

                return farm;
        }

        @Transactional
        public SoilSample receiveSoilSample(String farmId, String collectedById,
                        String assignedExpertId, Integer numPoints,
                        String priority) {
                Farm farm = farmRepository.findById(farmId)
                                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));

                SoilSample sample = SoilSample.builder()
                                .farmId(farmId)
                                .collectedBy(collectedById)
                                .assignedExpertId(assignedExpertId)
                                .numPoints(numPoints != null ? numPoints : 8)
                                .priority(priority != null ? priority : "NORMAL")
                                .status("AT_LAB")
                                .receivedAtLab(LocalDateTime.now())
                                .collectionDate(LocalDate.now())
                                .build();
                sample = soilSampleRepository.save(sample);

                // Notify expert
                if (assignedExpertId != null) {
                        User expert = userRepository.findById(assignedExpertId).orElse(null);
                        if (expert != null) {
                                notificationService.notify(assignedExpertId, null, "CLUSTER_ADMIN",
                                                "New Soil Sample Assigned",
                                                "New sample assigned — Farm " + farm.getFarmCode() + ". Priority: "
                                                                + sample.getPriority(),
                                                "ACTION_REQUIRED", farmId, "SOIL_SAMPLE", sample.getId());
                        }
                }

                // Notify land owner
                notificationService.notify(farm.getOwnerId(), null, "CLUSTER_ADMIN",
                                "Soil Sampling Logged",
                                "Soil sampling has been logged for your farm " + farm.getFarmCode(),
                                "INFO", farmId, "SOIL_SAMPLE", sample.getId());

                return sample;
        }

        public Map<String, Object> getStats(String clusterId) {
                Map<String, Object> stats = new HashMap<>();
                List<Farm> farms = clusterId != null ? farmRepository.findByClusterId(clusterId)
                                : farmRepository.findAll();

                stats.put("totalFarms", farms.size());
                stats.put("activeFarms", farms.stream().filter(f -> "ACTIVE".equals(f.getStatus())).count());
                stats.put("pendingFarms", farms.stream().filter(f -> "PENDING".equals(f.getStatus())).count());

                long pendingSamples = soilSampleRepository.findByStatus("AT_LAB").size()
                                + soilSampleRepository.findByStatus("TESTING").size();
                stats.put("pendingSamples", pendingSamples);

                return stats;
        }

        // ─── Detail methods ───────────────────────────────────────────────────────

        public Map<String, Object> getExpertDetail(String expertId) {
                User expert = userRepository.findById(expertId)
                                .orElseThrow(() -> new RuntimeException("Expert not found: " + expertId));
                List<Farm> farms = farmRepository.findByExpertId(expertId);
                List<String> farmIds = farms.stream().map(Farm::getId).toList();
                List<SoilReport> reports = soilReportRepository.findByExpertId(expertId);
                List<SoilSample> samples = soilSampleRepository.findByAssignedExpertId(expertId);
                List<SoilSample> pendingSamples = samples.stream()
                                .filter(s -> !"COMPLETED".equals(s.getStatus())).toList();

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("user", expert);
                result.put("assignedFarms", farms);
                result.put("soilReports", reports);
                result.put("pendingSamples", pendingSamples);
                result.put("stats", Map.of(
                                "totalFarms", farms.size(),
                                "totalReports", reports.size(),
                                "totalSamples", samples.size(),
                                "pendingSamples", pendingSamples.size()));
                return result;
        }

        public Map<String, Object> getFieldManagerDetail(String managerId) {
                User manager = userRepository.findById(managerId)
                                .orElseThrow(() -> new RuntimeException("Field Manager not found: " + managerId));
                List<Farm> farms = farmRepository.findByFieldManagerId(managerId);
                List<String> farmIds = farms.stream().map(Farm::getId).toList();
                List<FieldOperation> operations = fieldOperationRepository.findByFieldManagerId(managerId);
                List<SoilSample> samples = farmIds.isEmpty() ? List.of()
                                : soilSampleRepository.findByFarmIdIn(farmIds);
                List<CalendarTask> tasks = farmIds.isEmpty() ? List.of()
                                : calendarTaskRepository.findByFarmIdIn(farmIds);
                List<CalendarTask> pendingTasks = tasks.stream()
                                .filter(t -> "PENDING".equals(t.getStatus())).toList();

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("user", manager);
                result.put("assignedFarms", farms);
                result.put("operations", operations);
                result.put("samples", samples);
                result.put("pendingTasks", pendingTasks);
                result.put("stats", Map.of(
                                "totalFarms", farms.size(),
                                "totalOperations", operations.size(),
                                "totalSamples", samples.size(),
                                "pendingTasks", pendingTasks.size()));
                return result;
        }

        public Map<String, Object> getWorkerDetail(String workerId) {
                User worker = userRepository.findById(workerId)
                                .orElseThrow(() -> new RuntimeException("Worker not found: " + workerId));
                // Workers are linked to farms via tasks assigned to their cluster
                // We surface tasks and operations from farms in the same cluster
                String clusterId = worker.getClusterId();
                List<Farm> clusterFarms = clusterId != null ? farmRepository.findByClusterId(clusterId)
                                : List.of();
                List<String> farmIds = clusterFarms.stream().map(Farm::getId).toList();
                List<CalendarTask> tasks = farmIds.isEmpty() ? List.of()
                                : calendarTaskRepository.findByFarmIdIn(farmIds);
                List<FieldOperation> operations = farmIds.isEmpty() ? List.of()
                                : fieldOperationRepository.findAll().stream()
                                                .filter(op -> farmIds.contains(op.getFarmId()))
                                                .toList();

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("user", worker);
                result.put("assignedTasks", tasks);
                result.put("operations", operations);
                result.put("stats", Map.of(
                                "totalTasks", tasks.size(),
                                "completedTasks",
                                tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count(),
                                "totalOperations", operations.size()));
                return result;
        }

        public Map<String, Object> getLandOwnerDetail(String ownerId) {
                User owner = userRepository.findById(ownerId)
                                .orElseThrow(() -> new RuntimeException("Land Owner not found: " + ownerId));
                List<Farm> farms = farmRepository.findByOwnerId(ownerId);
                List<String> farmIds = farms.stream().map(Farm::getId).toList();
                List<SoilReport> reports = farmIds.isEmpty() ? List.of()
                                : soilReportRepository.findByFarmIdIn(farmIds);
                List<CropSuggestion> suggestions = farmIds.isEmpty() ? List.of()
                                : cropSuggestionRepository.findByFarmIdIn(farmIds);
                double totalAcres = farms.stream().mapToDouble(f -> f.getTotalLand() != null ? f.getTotalLand() : 0)
                                .sum();

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("user", owner);
                result.put("farms", farms);
                result.put("soilReports", reports);
                result.put("cropSuggestions", suggestions);
                result.put("stats", Map.of(
                                "totalFarms", farms.size(),
                                "totalAcres", totalAcres,
                                "totalReports", reports.size(),
                                "totalSuggestions", suggestions.size()));
                return result;
        }

        public Map<String, Object> getSampleDetail(String sampleId) {
                SoilSample sample = soilSampleRepository.findById(sampleId)
                                .orElseThrow(() -> new RuntimeException("Sample not found: " + sampleId));
                Farm farm = farmRepository.findById(sample.getFarmId()).orElse(null);
                User expert = sample.getAssignedExpertId() != null
                                ? userRepository.findById(sample.getAssignedExpertId()).orElse(null)
                                : null;
                User collector = userRepository.findById(sample.getCollectedBy()).orElse(null);
                Optional<SoilReport> report = soilReportRepository.findBySampleId(sampleId);

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("sample", sample);
                result.put("farm", farm);
                result.put("assignedExpert", expert);
                result.put("collector", collector);
                result.put("soilReport", report.orElse(null));
                result.put("pipeline", List.of("COLLECTED", "AT_LAB", "TESTING", "COMPLETED"));
                return result;
        }

        public Map<String, Object> getAlertDetail(String alertId) {
                PestAlert alert = pestAlertRepository.findById(alertId)
                                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));
                Farm farm = farmRepository.findById(alert.getFarmId()).orElse(null);
                User reporter = userRepository.findById(alert.getReportedBy()).orElse(null);
                List<Prescription> prescriptions = prescriptionRepository.findByAlertId(alertId);

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("alert", alert);
                result.put("farm", farm);
                result.put("reporter", reporter);
                result.put("prescriptions", prescriptions);
                result.put("stats", Map.of(
                                "totalPrescriptions", prescriptions.size(),
                                "acknowledgedPrescriptions",
                                prescriptions.stream().filter(Prescription::isAcknowledged).count()));
                return result;
        }
}
