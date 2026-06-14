package com.greenx.farmapi.service;

import com.greenx.farmapi.entity.Farm;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.FarmRepository;
import com.greenx.farmapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmAllocationService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final FarmWorkflowService workflowService;
    private final NotificationService notificationService;

    /**
     * Assign both a field manager and an expert to a farm in one operation.
     * Delegates status update and notifications to {@link FarmWorkflowService}.
     *
     * @param farmId         the farm to allocate
     * @param fieldManagerId user ID of the field manager
     * @param expertId       user ID of the expert
     * @param adminId        user ID of the cluster admin performing the allocation
     * @return the updated {@link Farm}
     */
    @Transactional
    public Farm allocateFarmToTeam(String farmId, String fieldManagerId, String expertId, String adminId) {
        // Validate that the users exist and have the expected roles before persisting
        User fieldManager = userRepository.findById(fieldManagerId)
                .orElseThrow(() -> new RuntimeException("Field manager not found: " + fieldManagerId));
        User expert = userRepository.findById(expertId)
                .orElseThrow(() -> new RuntimeException("Expert not found: " + expertId));

        return workflowService.allocateFarm(farmId, fieldManager.getId(), expert.getId(), adminId);
    }

    /**
     * Assign only a field manager to a farm (expert may be set separately).
     */
    @Transactional
    public Farm assignFieldManager(String farmId, String fieldManagerId, String adminId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));

        farm.setFieldManagerId(fieldManagerId);
        if ("PENDING".equals(farm.getStatus())) {
            farm.setStatus("ACTIVE");
        }
        farm = farmRepository.save(farm);

        User manager = userRepository.findById(fieldManagerId).orElse(null);
        String managerName = manager != null ? manager.getName() : "Field Manager";

        // Notify field manager
        notifyAssignment(farmId, fieldManagerId, adminId, farm.getFarmCode(), "FIELD_MANAGER",
                "Farm Assigned to You",
                "You have been assigned as field manager for farm " + farm.getFarmCode());

        // Notify landowner
        notifyAssignment(farmId, farm.getOwnerId(), adminId, farm.getFarmCode(), "CLUSTER_ADMIN",
                "Field Manager Assigned",
                "Your farm " + farm.getFarmCode() + " is now active. Manager: " + managerName);

        return farm;
    }

    /**
     * Assign only an expert to a farm (field manager may be set separately).
     */
    @Transactional
    public Farm assignExpert(String farmId, String expertId, String adminId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found: " + farmId));

        farm.setExpertId(expertId);
        farm = farmRepository.save(farm);

        User expert = userRepository.findById(expertId).orElse(null);
        String expertName = expert != null ? expert.getName() : "Expert";

        // Notify expert
        notifyAssignment(farmId, expertId, adminId, farm.getFarmCode(), "EXPERT",
                "Farm Assigned to You",
                "You have been assigned as expert for farm " + farm.getFarmCode());

        // Notify landowner
        notifyAssignment(farmId, farm.getOwnerId(), adminId, farm.getFarmCode(), "CLUSTER_ADMIN",
                "Expert Assigned",
                "Expert " + expertName + " has been assigned to your farm " + farm.getFarmCode());

        return farm;
    }

    /**
     * Returns all farms assigned to a given user (as field manager or expert).
     */
    public List<Farm> getFarmsAssignedToFieldManager(String fieldManagerId) {
        return farmRepository.findByFieldManagerId(fieldManagerId);
    }

    /**
     * Returns all farms assigned to a given expert.
     */
    public List<Farm> getFarmsAssignedToExpert(String expertId) {
        return farmRepository.findByExpertId(expertId);
    }

    /**
     * Returns all farms that have not yet been assigned a field manager.
     */
    public List<Farm> getUnassignedFarms() {
        return farmRepository.findUnassignedFarms();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void notifyAssignment(String farmId, String toUserId, String fromUserId,
            String farmCode, String fromRole, String title, String message) {
        notificationService.notify(toUserId, fromUserId, fromRole,
                title, message, "INFO", farmId, "FARM", farmId);
    }
}
