package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByToUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByToUserIdAndIsReadFalse(String userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.toUserId = :userId AND n.isRead = false")
    long countUnreadByUserId(@Param("userId") String userId);

    List<Notification> findByToUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
}
