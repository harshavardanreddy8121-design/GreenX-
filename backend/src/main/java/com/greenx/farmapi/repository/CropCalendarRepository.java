package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.CropCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropCalendarRepository extends JpaRepository<CropCalendar, String> {
    List<CropCalendar> findByFarmId(String farmId);

    List<CropCalendar> findByExpertId(String expertId);

    List<CropCalendar> findByStatus(String status);

    List<CropCalendar> findByFarmIdAndStatus(String farmId, String status);
}
