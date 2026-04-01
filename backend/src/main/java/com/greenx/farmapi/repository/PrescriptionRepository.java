package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, String> {
    List<Prescription> findByAlertId(String alertId);

    List<Prescription> findByExpertId(String expertId);

    List<Prescription> findByIsAcknowledgedFalse();
}
