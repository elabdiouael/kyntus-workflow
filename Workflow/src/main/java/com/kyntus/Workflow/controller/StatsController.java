package com.kyntus.Workflow.controller;

import com.kyntus.Workflow.dto.PilotStatsDto;
import com.kyntus.Workflow.model.Role;
import com.kyntus.Workflow.model.Task;
import com.kyntus.Workflow.model.User;
import com.kyntus.Workflow.repository.TaskRepository;
import com.kyntus.Workflow.repository.UserRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:3000")
public class StatsController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public StatsController(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping("/leaderboard")
    public List<PilotStatsDto> getLeaderboard() {
        // 1. Récupérer tous les pilotes
        List<User> pilots = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.PILOT)
                .collect(Collectors.toList());

        List<PilotStatsDto> statsList = new ArrayList<>();

        // 2. Calculer le score pour chaque pilote
        for (User pilot : pilots) {
            // Récupérer toutes les tâches du pilote
            List<Task> myTasks = taskRepository.findByAssigneeId(pilot.getId());

            int total = myTasks.size();
            // Filtrer par statut
            List<Task> validatedTasks = myTasks.stream().filter(t -> "VALIDE".equals(t.getStatus())).toList();
            List<Task> rejectedTasks = myTasks.stream().filter(t -> "REJETE".equals(t.getStatus())).toList();

            int validCount = validatedTasks.size();
            int rejectCount = rejectedTasks.size();

            // --- A. CALCUL DU SCORE "TIME ATTACK" ---
            // Base: 100pts par tâche. Malus: 0.5pt par minute.
            double rawTaskScore = 0;
            long totalTimeSeconds = 0;

            for (Task t : validatedTasks) {
                long seconds = t.getCumulativeTimeSeconds() != null ? t.getCumulativeTimeSeconds() : 0;
                totalTimeSeconds += seconds;

                double minutes = seconds / 60.0;
                double taskScore = 100.0 - (minutes * 0.5);

                // On ne descend pas en dessous de 10pts (pour encourager à finir même en retard)
                if (taskScore < 10) taskScore = 10;

                rawTaskScore += taskScore;
            }

            double avgTime = (validCount > 0) ? (double) totalTimeSeconds / validCount : 0;

            // --- B. CALCUL DU RATIO QUALITÉ ---
            // Formule: Valid / (Valid + Rejected)
            int processed = validCount + rejectCount;
            double qualityRatio = (processed > 0) ? (double) validCount / processed : 0.0; // ex: 0.95

            // --- C. SCORE FINAL ---
            // Formule: (Score Tâches + Points Manuels) * Qualité
            double totalWithBonus = rawTaskScore + pilot.getManualPoints();

            // On applique le multiplicateur de qualité
            double finalLeaguePoints = totalWithBonus * qualityRatio;

            // Arrondir à 1 décimale
            finalLeaguePoints = Math.round(finalLeaguePoints * 10.0) / 10.0;
            double qualityPercentage = Math.round(qualityRatio * 100.0 * 10.0) / 10.0;

            statsList.add(new PilotStatsDto(
                    pilot.getId(),
                    pilot.getUsername(),
                    total,
                    validCount,
                    rejectCount,
                    qualityPercentage,      // Quality %
                    pilot.getManualPoints(),// Manual Bonus
                    avgTime,                // Avg Time (sec)
                    finalLeaguePoints       // SCORE FINAL
            ));
        }

        // 3. Trier par SCORE FINAL (Le Premier League !)
        return statsList.stream()
                .sorted(Comparator.comparingDouble(PilotStatsDto::getLeaguePoints).reversed())
                .collect(Collectors.toList());
    }
}