package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.ScheduleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleItemRepository extends JpaRepository<ScheduleItem, String> {

    List<ScheduleItem> findByFarmId(String farmId);

    List<ScheduleItem> findByExpertId(String expertId);

    List<ScheduleItem> findByFarmIdOrderByScheduledDateAsc(String farmId);

    List<ScheduleItem> findByFarmIdAndStatus(String farmId, String status);

    List<ScheduleItem> findByFarmIdAndScheduledDateBetween(String farmId, LocalDate from, LocalDate to);

    List<ScheduleItem> findByFarmIdIn(List<String> farmIds);
}
