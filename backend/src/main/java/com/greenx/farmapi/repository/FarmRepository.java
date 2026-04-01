package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmRepository extends JpaRepository<Farm, String> {

    List<Farm> findByOwnerId(String ownerId);

    List<Farm> findByFieldManagerId(String fieldManagerId);

    List<Farm> findByExpertId(String expertId);

    List<Farm> findByClusterId(String clusterId);

    List<Farm> findByFieldManagerIdIsNull();

    List<Farm> findByStatus(String status);

    Optional<Farm> findByFarmCode(String farmCode);

    @Query("SELECT f FROM Farm f WHERE f.ownerId = :ownerId AND f.status != 'INACTIVE'")
    List<Farm> findActiveByOwner(@Param("ownerId") String ownerId);

    @Query("SELECT f FROM Farm f WHERE f.fieldManagerId IS NULL AND f.status = 'PENDING'")
    List<Farm> findUnassignedFarms();
}
