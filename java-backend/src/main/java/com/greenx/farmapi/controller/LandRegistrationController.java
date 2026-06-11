package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.LandRegistrationSubmission;
import com.greenx.farmapi.repository.LandRegistrationSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class LandRegistrationController {

    private final LandRegistrationSubmissionRepository submissionRepository;

    // ─── Public: submit from landing page ────────────────────────────────────

    @PostMapping("/api/land-registration/submit")
    public ApiResponse<LandRegistrationSubmission> submit(@RequestBody Map<String, String> body) {
        String fullName = body.get("fullName");
        String phone    = body.get("phone");
        String location = body.get("location");
        String landSize = body.get("landSize");
        String message  = body.get("message");

        if (fullName == null || fullName.isBlank()) return ApiResponse.error("Full name is required");
        if (phone    == null || phone.isBlank())    return ApiResponse.error("Phone is required");
        if (location == null || location.isBlank()) return ApiResponse.error("Location is required");
        if (landSize == null || landSize.isBlank()) return ApiResponse.error("Land size is required");

        LandRegistrationSubmission submission = LandRegistrationSubmission.builder()
                .fullName(fullName.trim())
                .phone(phone.trim())
                .location(location.trim())
                .landSize(landSize.trim())
                .message(message != null ? message.trim() : null)
                .build();

        return ApiResponse.success(submissionRepository.save(submission));
    }

    // ─── Admin: list all submissions (with optional status filter) ────────────

    @GetMapping("/api/admin/land-registrations")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUSTER_ADMIN')")
    public ApiResponse<List<LandRegistrationSubmission>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String location) {

        List<LandRegistrationSubmission> results;

        if (status != null && !status.isBlank()) {
            results = submissionRepository.findByStatus(status.toUpperCase());
        } else if (phone != null && !phone.isBlank()) {
            results = submissionRepository.findByPhoneContaining(phone.trim());
        } else if (location != null && !location.isBlank()) {
            results = submissionRepository.findByLocationContainingIgnoreCase(location.trim());
        } else {
            results = submissionRepository.findAllByOrderBySubmittedAtDesc();
        }

        return ApiResponse.success(results);
    }

    // ─── Admin: get single submission ─────────────────────────────────────────

    @GetMapping("/api/admin/land-registrations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUSTER_ADMIN')")
    public ApiResponse<LandRegistrationSubmission> getById(@PathVariable String id) {
        Optional<LandRegistrationSubmission> opt = submissionRepository.findById(id);
        return opt.map(ApiResponse::success)
                  .orElse(ApiResponse.error("Submission not found"));
    }

    // ─── Admin: update status ─────────────────────────────────────────────────

    @PutMapping("/api/admin/land-registrations/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUSTER_ADMIN')")
    public ApiResponse<LandRegistrationSubmission> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) return ApiResponse.error("Status is required");

        return submissionRepository.findById(id).map(sub -> {
            sub.setStatus(newStatus.toUpperCase());
            return ApiResponse.success(submissionRepository.save(sub));
        }).orElse(ApiResponse.error("Submission not found"));
    }

    // ─── Admin: add/update notes ──────────────────────────────────────────────

    @PutMapping("/api/admin/land-registrations/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUSTER_ADMIN')")
    public ApiResponse<LandRegistrationSubmission> updateNotes(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        String notes = body.get("notes");
        return submissionRepository.findById(id).map(sub -> {
            sub.setNotes(notes);
            return ApiResponse.success(submissionRepository.save(sub));
        }).orElse(ApiResponse.error("Submission not found"));
    }

    // ─── Admin: delete submission ─────────────────────────────────────────────

    @DeleteMapping("/api/admin/land-registrations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUSTER_ADMIN')")
    public ApiResponse<String> delete(@PathVariable String id) {
        if (!submissionRepository.existsById(id)) {
            return ApiResponse.error("Submission not found");
        }
        submissionRepository.deleteById(id);
        return ApiResponse.success("Deleted successfully");
    }
}
