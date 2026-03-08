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
                        "New sample assigned — Farm " + farm.getFarmCode() + ". Priority: " + sample.getPriority(),
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
        List<Farm> farms = clusterId != null ? farmRepository.findByClusterId(clusterId) : farmRepository.findAll();

        stats.put("totalFarms", farms.size());
        stats.put("activeFarms", farms.stream().filter(f -> "ACTIVE".equals(f.getStatus())).count());
        stats.put("pendingFarms", farms.stream().filter(f -> "PENDING".equals(f.getStatus())).count());

        long pendingSamples = soilSampleRepository.findByStatus("AT_LAB").size()
                + soilSampleRepository.findByStatus("TESTING").size();
        stats.put("pendingSamples", pendingSamples);

        return stats;
    }
}
