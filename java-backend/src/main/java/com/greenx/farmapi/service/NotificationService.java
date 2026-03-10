package com.greenx.farmapi.service;

import com.greenx.farmapi.entity.Notification;
import com.greenx.farmapi.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Notification notify(String toUserId, String fromUserId, String fromRole,
            String title, String message, String type,
            String farmId, String entityType, String entityId) {
        Notification n = Notification.builder()
                .toUserId(toUserId)
                .fromUserId(fromUserId)
                .fromRole(fromRole)
                .title(title)
                .message(message)
                .type(type != null ? type : "INFO")
                .relatedFarmId(farmId)
                .relatedEntityType(entityType)
                .relatedEntityId(entityId)
                .build();
        notificationRepository.save(n);

        // Push via WebSocket
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", n.getId());
            payload.put("toUserId", n.getToUserId());
            payload.put("fromRole", n.getFromRole());
            payload.put("title", n.getTitle());
            payload.put("message", n.getMessage());
            payload.put("type", n.getType());
            payload.put("relatedFarmId", n.getRelatedFarmId());
            payload.put("relatedEntityType", n.getRelatedEntityType());
            payload.put("relatedEntityId", n.getRelatedEntityId());
            payload.put("isread", false);
            payload.put("createdAt", n.getCreatedAt().toString());
            messagingTemplate.convertAndSendToUser(toUserId, "/queue/notifications", payload);
        } catch (Exception ignored) {
            // WebSocket push failure is non-fatal
        }
        return n;
    }

    public Notification notify(String toUserId, String title, String message, String type, String farmId) {
        return notify(toUserId, null, null, title, message, type, farmId, null, null);
    }

    public List<Notification> getAll(String userId) {
        return notificationRepository.findByToUserIdOrderByCreatedAtDesc(userId);
    }

    public long countUnread(String userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    public Notification markRead(String notificationId, String userId) {
        return notificationRepository.findById(notificationId).map(n -> {
            if (n.getToUserId().equals(userId)) {
                n.setRead(true);
                n.setReadAt(LocalDateTime.now());
                notificationRepository.save(n);
            }
            return n;
        }).orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    public void markAllRead(String userId) {
        List<Notification> unread = notificationRepository.findByToUserIdAndIsReadFalse(userId);
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }
}
