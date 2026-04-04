package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.CalendarTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalendarTaskRepository extends JpaRepository<CalendarTask, String> {
    List<CalendarTask> findByCalendarId(String calendarId);

    List<CalendarTask> findByFarmId(String farmId);

    List<CalendarTask> findByFarmIdAndStatus(String farmId, String status);

    @Query("SELECT t FROM CalendarTask t WHERE t.farmId = :farmId AND t.scheduledDate = :date")
    List<CalendarTask> findByFarmIdAndScheduledDate(@Param("farmId") String farmId,
            @Param("date") LocalDate date);

    @Query("SELECT t FROM CalendarTask t WHERE t.farmId IN :farmIds AND t.scheduledDate = :date")
    List<CalendarTask> findTodayTasksForFarms(@Param("farmIds") List<String> farmIds,
            @Param("date") LocalDate date);
}
