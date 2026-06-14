package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.Notification;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.NotificationRepository;
import com.greenx.farmapi.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    /**
     * Retrieve all unread notifications for the authenticated user.
     */
    @GetMapping("/unread")
    public ApiResponse<List<Notification>> getUnreadNotifications(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(
                    notificationRepository.findByToUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving notifications: " + e.getMessage());
        }
    }

    /**
     * Retrieve all notifications (read and unread) for the authenticated user,
     * ordered by most recent first.
     */
    @GetMapping("/all")
    public ApiResponse<List<Notification>> getAllNotifications(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(notificationService.getAll(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving notifications: " + e.getMessage());
        }
    }

    /**
     * Return the count of unread notifications for the authenticated user.
     */
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(notificationService.countUnread(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error retrieving count: " + e.getMessage());
        }
    }

    /**
     * Mark a single notification as read.
     * Only the owning user may mark their own notifications.
     */
    @PutMapping("/{notificationId}/read")
    public ApiResponse<Notification> markAsRead(
            @PathVariable String notificationId,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(notificationService.markRead(notificationId, user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error marking notification as read: " + e.getMessage());
        }
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    @PutMapping("/mark-all-read")
    public ApiResponse<String> markAllAsRead(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            notificationService.markAllRead(user.getId());
            return ApiResponse.success("All notifications marked as read");
        } catch (Exception e) {
            return ApiResponse.error("Error marking notifications as read: " + e.getMessage());
        }
    }
}
