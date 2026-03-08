package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.SoilSample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoilSampleRepository extends JpaRepository<SoilSample, String> {
    List<SoilSample> findByFarmId(String farmId);

    List<SoilSample> findByAssignedExpertId(String expertId);

    List<SoilSample> findByAssignedExpertIdAndStatus(String expertId, String status);

    List<SoilSample> findByStatus(String status);
}
