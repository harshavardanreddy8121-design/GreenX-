package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.SiteVisitReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SiteVisitReportRepository extends JpaRepository<SiteVisitReport, String> {

    List<SiteVisitReport> findByFarmId(String farmId);

    List<SiteVisitReport> findByFieldManagerId(String fieldManagerId);

    List<SiteVisitReport> findByFarmIdOrderByVisitDateDesc(String farmId);

    List<SiteVisitReport> findByFarmIdAndVisitDateBetween(String farmId, LocalDate from, LocalDate to);

    List<SiteVisitReport> findByFarmIdIn(List<String> farmIds);

    List<SiteVisitReport> findByFarmIdInOrderByVisitDateDesc(List<String> farmIds);
}
