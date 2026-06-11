package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, String> {

    List<AiConversation> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    List<AiConversation> findByUserIdOrderByCreatedAtDesc(String userId);

    List<AiConversation> findByFarmIdOrderByCreatedAtDesc(String farmId);

    @Query("SELECT c FROM AiConversation c WHERE c.userId = :userId AND c.type = :type ORDER BY c.createdAt DESC")
    List<AiConversation> findByUserIdAndType(@Param("userId") String userId, @Param("type") String type);

    @Query("SELECT c FROM AiConversation c WHERE c.sessionId = :sessionId ORDER BY c.createdAt ASC")
    List<AiConversation> findConversationHistory(@Param("sessionId") String sessionId);

    long countByUserId(String userId);
}
