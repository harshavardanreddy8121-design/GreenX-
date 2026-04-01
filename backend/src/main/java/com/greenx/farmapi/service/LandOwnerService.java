package com.greenx.farmapi.service;

import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LandOwnerService {

    private final FarmRepository farmRepository;
    private final SoilReportRepository soilReportRepository;
    private final CropSuggestionRepository cropSuggestionRepository;
    private final CropCalendarRepository cropCalendarRepository;
    private final FieldOperationRepository fieldOperationRepository;
    private final NotificationService notificationService;
    private final com.greenx.farmapi.repository.UserRepository userRepository;

    public List<Farm> getFarmsForOwner(String ownerId) {
        return farmRepository.findByOwnerId(ownerId);
    }

    public List<SoilReport> getSoilReports(String ownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(ownerId);
        List<SoilReport> reports = new ArrayList<>();
        farms.forEach(f -> reports.addAll(soilReportRepository.findByFarmId(f.getId())));
        reports.sort(Comparator.comparing(SoilReport::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return reports;
    }

    public List<CropSuggestion> getCropSuggestions(String ownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(ownerId);
        List<CropSuggestion> suggestions = new ArrayList<>();
        farms.forEach(f -> suggestions.addAll(cropSuggestionRepository.findByFarmId(f.getId())));
        return suggestions;
    }

    @Transactional
    public CropSuggestion selectCrop(String suggestionId, String ownerId) {
        CropSuggestion suggestion = cropSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new RuntimeException("Suggestion not found: " + suggestionId));

        // Deselect all others for this farm
        cropSuggestionRepository.findByFarmId(suggestion.getFarmId()).forEach(s -> {
            if (!s.getId().equals(suggestionId) && s.isSelected()) {
                s.setSelected(false);
                s.setSelectedAt(null);
                cropSuggestionRepository.save(s);
            }
        });

        suggestion.setSelected(true);
        suggestion.setSelectedAt(LocalDateTime.now());
        suggestion = cropSuggestionRepository.save(suggestion);

        Farm farm = farmRepository.findById(suggestion.getFarmId()).orElse(null);
        String farmCode = farm != null ? farm.getFarmCode() : suggestion.getFarmId();

        // Notify expert
        notificationService.notify(suggestion.getExpertId(), ownerId, "LAND_OWNER",
                "Crop Selected: " + suggestion.getCropName(),
                "Land owner selected " + suggestion.getCropName() + " for Farm " + farmCode,
                "SUCCESS", suggestion.getFarmId(), "CROP_SUGGESTION", suggestionId);

        // Notify field manager
        if (farm != null && farm.getFieldManagerId() != null) {
            notificationService.notify(farm.getFieldManagerId(), ownerId, "LAND_OWNER",
                    "Crop Confirmed: " + suggestion.getCropName(),
                    "Crop confirmed for Farm " + farmCode + ": " + suggestion.getCropName(),
                    "INFO", farm.getId(), "CROP_SUGGESTION", suggestionId);
        }

        return suggestion;
    }

    public Map<String, Object> getFinanceSummary(String ownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(ownerId);
        BigDecimal totalCosts = BigDecimal.ZERO;
        Map<String, BigDecimal> costByType = new LinkedHashMap<>();

        for (Farm farm : farms) {
            BigDecimal farmCost = fieldOperationRepository.sumCostByFarmId(farm.getId());
            totalCosts = totalCosts.add(farmCost != null ? farmCost : BigDecimal.ZERO);

            List<Object[]> byType = fieldOperationRepository.sumCostByTypeAndFarmId(farm.getId());
            for (Object[] row : byType) {
                String type = (String) row[0];
                BigDecimal cost = (BigDecimal) row[1];
                costByType.merge(type, cost != null ? cost : BigDecimal.ZERO, BigDecimal::add);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalCosts", totalCosts);
        result.put("costByType", costByType);
        result.put("landOwnerShare70", totalCosts.multiply(BigDecimal.valueOf(0.7)));
        result.put("farmCount", farms.size());
        return result;
    }

    public List<FieldOperation> getOperationsFeed(String ownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(ownerId);
        List<FieldOperation> ops = new ArrayList<>();
        farms.forEach(f -> ops.addAll(fieldOperationRepository.findByFarmIdOrderByOperationDateDesc(f.getId())));
        ops.sort(Comparator.comparing(o -> o.getOperationDate() != null ? o.getOperationDate() : LocalDateTime.MIN,
                Comparator.reverseOrder()));
        return ops;
    }

    public Map<String, Object> getStats(String ownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(ownerId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFarms", farms.size());
        stats.put("activeFarms", farms.stream().filter(f -> "ACTIVE".equals(f.getStatus())).count());
        BigDecimal totalCost = BigDecimal.ZERO;
        for (Farm f : farms) {
            BigDecimal c = fieldOperationRepository.sumCostByFarmId(f.getId());
            if (c != null)
                totalCost = totalCost.add(c);
        }
        stats.put("totalCost", totalCost);
        return stats;
    }
}
