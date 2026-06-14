package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.FieldUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FieldUpdateRepository extends JpaRepository<FieldUpdate, String> {

    List<FieldUpdate> findByFarmId(String farmId);

    List<FieldUpdate> findByFieldManagerId(String fieldManagerId);

    List<FieldUpdate> findByFarmIdOrderByCreatedAtDesc(String farmId);

    List<FieldUpdate> findByFarmIdAndUpdateType(String farmId, String updateType);

    List<FieldUpdate> findByRelatedScheduleItemId(String scheduleItemId);

    List<FieldUpdate> findByFarmIdIn(List<String> farmIds);
}
