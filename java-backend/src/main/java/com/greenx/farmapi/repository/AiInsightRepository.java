package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, String> {

    List<AiInsight> findByFarmIdAndIsDismissedFalseOrderByCreatedAtDesc(String farmId);

    List<AiInsight> findByUserIdAndIsDismissedFalseOrderByCreatedAtDesc(String userId);

    @Query("SELECT i FROM AiInsight i WHERE i.isDismissed = false ORDER BY i.createdAt DESC")
    List<AiInsight> findAllActiveInsights();

    @Query("SELECT i FROM AiInsight i WHERE i.farmId = :farmId AND i.severity IN ('WARNING','CRITICAL') AND i.isDismissed = false ORDER BY i.createdAt DESC")
    List<AiInsight> findCriticalInsightsByFarm(@Param("farmId") String farmId);

    long countByFarmIdAndIsReadFalse(String farmId);
}
