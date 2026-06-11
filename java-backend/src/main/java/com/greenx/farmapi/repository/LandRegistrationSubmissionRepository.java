package com.greenx.farmapi.repository;

import com.greenx.farmapi.entity.LandRegistrationSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandRegistrationSubmissionRepository extends JpaRepository<LandRegistrationSubmission, String> {

    List<LandRegistrationSubmission> findByStatus(String status);

    List<LandRegistrationSubmission> findByPhoneContaining(String phone);

    List<LandRegistrationSubmission> findByLocationContainingIgnoreCase(String location);

    List<LandRegistrationSubmission> findAllByOrderBySubmittedAtDesc();
}
