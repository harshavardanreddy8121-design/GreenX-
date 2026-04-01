package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.CropSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropSuggestionRepository extends JpaRepository<CropSuggestion, String> {
    List<CropSuggestion> findByFarmId(String farmId);

    List<CropSuggestion> findByFarmIdAndIsSelectedTrue(String farmId);

    List<CropSuggestion> findByExpertId(String expertId);

    List<CropSuggestion> findByReportId(String reportId);

    void deleteByFarmId(String farmId);
}
