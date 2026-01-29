package com.kyntus.Workflow.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class PilotStatsDto {
    private Long id;
    private String username;

    // Stats de base
    private int totalTasks;
    private int validatedTasks;
    private int rejectedTasks;

    // Nouveaux Metrics
    private double qualityScore; // % de qualité (ex: 95.5%)
    private int manualPoints;    // Bonus/Malus Admin
    private double avgTimeSeconds; // Temps moyen par tâche

    // LE SCORE FINAL (Pour le classement)
    private double leaguePoints;
}