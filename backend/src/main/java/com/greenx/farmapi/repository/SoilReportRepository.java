package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.SoilReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoilReportRepository extends JpaRepository<SoilReport, String> {
    List<SoilReport> findByFarmId(String farmId);

    List<SoilReport> findByExpertId(String expertId);

    Optional<SoilReport> findBySampleId(String sampleId);

    List<SoilReport> findAllByOrderByCreatedAtDesc();

    List<SoilReport> findByFarmIdAndShareLandownerTrue(String farmId);

    List<SoilReport> findByFarmIdAndShareFieldmgrTrue(String farmId);

    List<SoilReport> findByFarmIdAndShareClusterTrue(String farmId);

    List<SoilReport> findByExpertIdAndFarmIdIn(String expertId, List<String> farmIds);

    List<SoilReport> findByFarmIdIn(List<String> farmIds);
}
