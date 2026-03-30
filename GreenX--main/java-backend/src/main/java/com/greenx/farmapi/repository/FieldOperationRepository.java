package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.FieldOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FieldOperationRepository extends JpaRepository<FieldOperation, String> {
    List<FieldOperation> findByFarmIdOrderByOperationDateDesc(String farmId);

    List<FieldOperation> findByFieldManagerId(String fieldManagerId);

    List<FieldOperation> findByFarmIdAndOperationType(String farmId, String operationType);

    @Query("SELECT COALESCE(SUM(f.costIncurred), 0) FROM FieldOperation f WHERE f.farmId = :farmId")
    BigDecimal sumCostByFarmId(@Param("farmId") String farmId);

    @Query("SELECT f.operationType, COALESCE(SUM(f.costIncurred), 0) FROM FieldOperation f WHERE f.farmId = :farmId GROUP BY f.operationType")
    List<Object[]> sumCostByTypeAndFarmId(@Param("farmId") String farmId);
}
