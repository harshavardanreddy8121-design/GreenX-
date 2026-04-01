package com.greenx.farmapi.service;

import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpertService {

    private final SoilSampleRepository soilSampleRepository;
    private final SoilReportRepository soilReportRepository;
    private final CropSuggestionRepository cropSuggestionRepository;
    private final CropCalendarRepository cropCalendarRepository;
    private final CalendarTaskRepository calendarTaskRepository;
    private final PestAlertRepository pestAlertRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final FarmRepository farmRepository;
    private final com.greenx.farmapi.repository.UserRepository userRepository;
    private final NotificationService notificationService;

    public List<SoilSample> getPendingSamples(String expertId) {
        return soilSampleRepository.findByAssignedExpertId(expertId)
                .stream()
                .filter(s -> !"COMPLETED".equals(s.getStatus()))
                .collect(Collectors.toList());
    }

    @Transactional
    public SoilReport uploadSoilReport(SoilReport report) {
        final SoilReport savedReport = soilReportRepository.save(report);

        // Update sample status
        if (savedReport.getSampleId() != null) {
            soilSampleRepository.findById(savedReport.getSampleId()).ifPresent(s -> {
                s.setStatus("COMPLETED");
                soilSampleRepository.save(s);
            });
        }

        Farm farm = farmRepository.findById(savedReport.getFarmId()).orElse(null);
        String farmCode = farm != null ? farm.getFarmCode() : savedReport.getFarmId();
        String summary = buildReportSummary(savedReport);

        // Notify based on share flags
        if (savedReport.isShareLandowner() && farm != null) {
            notificationService.notify(farm.getOwnerId(), savedReport.getExpertId(), "EXPERT",
                    "Soil Report Ready",
                    "Your soil report for " + farmCode + " is ready. " + summary,
                    "SUCCESS", farm.getId(), "SOIL_REPORT", savedReport.getId());
        }
        if (savedReport.isShareCluster() && farm != null && farm.getClusterId() != null) {
            // Notify admin users in the cluster
            userRepository.findByRoleAndClusterId("CLUSTER_ADMIN", farm.getClusterId())
                    .forEach(admin -> notificationService.notify(admin.getId(), savedReport.getExpertId(), "EXPERT",
                            "Soil Report Filed",
                            "Expert filed soil report for Farm " + farmCode,
                            "INFO", farm.getId(), "SOIL_REPORT", savedReport.getId()));
        }
        if (savedReport.isShareFieldmgr() && farm != null && farm.getFieldManagerId() != null) {
            notificationService.notify(farm.getFieldManagerId(), savedReport.getExpertId(), "EXPERT",
                    "Soil Report Available",
                    "Soil report for Farm " + farmCode + " has been filed.",
                    "INFO", farm.getId(), "SOIL_REPORT", savedReport.getId());
        }

        return savedReport;
    }

    @Transactional
    public List<CropSuggestion> saveCropSuggestions(List<CropSuggestion> suggestions) {
        if (suggestions.isEmpty())
            return suggestions;
        String farmId = suggestions.get(0).getFarmId();

        // Delete old suggestions for this farm
        cropSuggestionRepository.deleteByFarmId(farmId);

        List<CropSuggestion> saved = cropSuggestionRepository.saveAll(suggestions);

        Farm farm = farmRepository.findById(farmId).orElse(null);
        if (farm != null) {
            notificationService.notify(farm.getOwnerId(), suggestions.get(0).getExpertId(), "EXPERT",
                    "Crop Suggestions Ready",
                    "An expert has suggested crops for your farm " + farm.getFarmCode()
                            + ". Please select one to begin your season.",
                    "ACTION_REQUIRED", farmId, "CROP_SUGGESTION", null);
        }
        return saved;
    }

    @Transactional
    public CropCalendar publishCalendar(String calendarId) {
        CropCalendar cal = cropCalendarRepository.findById(calendarId)
                .orElseThrow(() -> new RuntimeException("Calendar not found: " + calendarId));
        cal.setStatus("PUBLISHED");
        cal.setPublishedAt(LocalDateTime.now());
        cal = cropCalendarRepository.save(cal);

        Farm farm = farmRepository.findById(cal.getFarmId()).orElse(null);
        String farmCode = farm != null ? farm.getFarmCode() : cal.getFarmId();

        if (farm != null && farm.getFieldManagerId() != null) {
            notificationService.notify(farm.getFieldManagerId(), cal.getExpertId(), "EXPERT",
                    "Season Calendar Published",
                    "Season calendar published for Farm " + farmCode + ". Tasks are now live.",
                    "ACTION_REQUIRED", farm.getId(), "CROP_CALENDAR", cal.getId());
        }
        if (farm != null) {
            notificationService.notify(farm.getOwnerId(), cal.getExpertId(), "EXPERT",
                    "Crop Calendar Ready",
                    "Your crop calendar is ready. Season starts " + cal.getSowingDate(),
                    "SUCCESS", farm.getId(), "CROP_CALENDAR", cal.getId());
        }
        return cal;
    }

    @Transactional
    public Prescription issuePrescription(Prescription prescription) {
        final Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Update alert status
        pestAlertRepository.findById(savedPrescription.getAlertId()).ifPresent(alert -> {
            alert.setStatus("PRESCRIPTION_ISSUED");
            pestAlertRepository.save(alert);

            Farm farm = farmRepository.findById(alert.getFarmId()).orElse(null);
            String farmCode = farm != null ? farm.getFarmCode() : alert.getFarmId();

            // Notify field manager (URGENT)
            if (farm != null && farm.getFieldManagerId() != null) {
                notificationService.notify(farm.getFieldManagerId(), savedPrescription.getExpertId(), "EXPERT",
                        "URGENT: Prescription Issued",
                        "Prescription issued for " + alert.getPestName() + " on farm " + farmCode
                                + ". Apply: " + savedPrescription.getChemicalName() + " at "
                                + savedPrescription.getDose(),
                        "URGENT", farm.getId(), "PRESCRIPTION", savedPrescription.getId());
            }
            // Notify cluster admin
            if (farm != null && farm.getClusterId() != null) {
                final String fId = farm.getId();
                userRepository.findByRoleAndClusterId("CLUSTER_ADMIN", farm.getClusterId())
                        .forEach(
                                admin -> notificationService.notify(admin.getId(), savedPrescription.getExpertId(),
                                        "EXPERT",
                                        "Pest Alert Resolved",
                                        "Prescription issued for alert on Farm " + farmCode,
                                        "INFO", fId, "PRESCRIPTION", savedPrescription.getId()));
            }
            // Notify land owner
            if (farm != null) {
                notificationService.notify(farm.getOwnerId(), savedPrescription.getExpertId(), "EXPERT",
                        "Pest Treatment Initiated",
                        "Your farm " + farmCode + " pest issue is being treated.",
                        "INFO", farm.getId(), "PRESCRIPTION", savedPrescription.getId());
            }
        });

        return savedPrescription;
    }

    private String buildReportSummary(SoilReport r) {
        return String.format("pH:%.1f, N:%.0f, P:%.0f, K:%.0f",
                r.getPhLevel() != null ? r.getPhLevel().doubleValue() : 0,
                r.getNitrogenKgHa() != null ? r.getNitrogenKgHa().doubleValue() : 0,
                r.getPhosphorusKgHa() != null ? r.getPhosphorusKgHa().doubleValue() : 0,
                r.getPotassiumKgHa() != null ? r.getPotassiumKgHa().doubleValue() : 0);
    }

    public Map<String, Object> getStats(String expertId) {
        return Map.of(
                "pendingSamples", soilSampleRepository.findByAssignedExpertIdAndStatus(expertId, "AT_LAB").size(),
                "reportsSubmitted", soilReportRepository.findByExpertId(expertId).size(),
                "openAlerts", pestAlertRepository.findByStatus("OPEN").size(),
                "prescriptionsIssued", prescriptionRepository.findByExpertId(expertId).size());
    }
}
