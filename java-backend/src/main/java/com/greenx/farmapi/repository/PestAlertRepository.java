package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.PestAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PestAlertRepository extends JpaRepository<PestAlert, String> {
    List<PestAlert> findByFarmId(String farmId);

    List<PestAlert> findByStatus(String status);

    List<PestAlert> findByFarmIdAndStatus(String farmId, String status);

    List<PestAlert> findAllByOrderByCreatedAtDesc();
}
