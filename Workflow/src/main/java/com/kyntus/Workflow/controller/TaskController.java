package com.kyntus.Workflow.controller;

import com.kyntus.Workflow.model.Task;
import com.kyntus.Workflow.repository.TaskRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // --- LE GETTER PRINCIPAL (Déjà fait, je le remets pour être sûr) ---
    @GetMapping
    public List<Task> getTasks(
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long templateId,
            @RequestParam(required = false) String status
    ) {
        if (assigneeId != null && templateId != null) {
            return taskRepository.findByAssigneeIdAndTemplateId(assigneeId, templateId);
        }
        if (assigneeId != null) {
            if (status != null) {
                return taskRepository.findAll().stream()
                        .filter(t -> t.getAssignee() != null && t.getAssignee().getId().equals(assigneeId))
                        .filter(t -> t.getStatus().equals(status))
                        .toList();
            }
            return taskRepository.findByAssigneeId(assigneeId);
        }
        if (templateId != null) {
            return taskRepository.findByTemplateId(templateId);
        }
        return taskRepository.findAll();
    }

    // --- 🔥 UPDATE STATUS AVEC CHRONO INTELLIGENT 🔥 ---
    @PatchMapping("/{id}/status")
    public Task updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Task task = taskRepository.findById(id).orElseThrow();
        String newStatus = payload.get("status");
        String oldStatus = task.getStatus();

        // 1. GESTION DU CHRONO (Time Attack)

        // Si on quitte "EN_COURS" (vers DONE ou A_FAIRE) -> On arrête le chrono et on sauvegarde le temps
        if ("EN_COURS".equals(oldStatus) && !"EN_COURS".equals(newStatus)) {
            if (task.getLastStartedAt() != null) {
                long secondsElapsed = ChronoUnit.SECONDS.between(task.getLastStartedAt(), LocalDateTime.now());
                long totalTime = (task.getCumulativeTimeSeconds() == null ? 0 : task.getCumulativeTimeSeconds()) + secondsElapsed;

                task.setCumulativeTimeSeconds(totalTime);
                task.setLastStartedAt(null); // Stop chrono
            }
        }

        // Si on entre dans "EN_COURS" (depuis A_FAIRE ou DONE) -> On démarre le chrono
        if ("EN_COURS".equals(newStatus) && !"EN_COURS".equals(oldStatus)) {
            task.setLastStartedAt(LocalDateTime.now());
        }

        // 2. Mise à jour du status
        task.setStatus(newStatus);

        return taskRepository.save(task);
    }

    // --- Update Data (Reste inchangé) ---
    @PatchMapping("/{id}/data")
    public Task updateData(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Task task = taskRepository.findById(id).orElseThrow();
        String key = (String) payload.get("key");
        Object value = payload.get("value");

        if (task.getDynamicData() != null) {
            task.getDynamicData().put(key, value);
        }
        return taskRepository.save(task);
    }

    // --- Endpoints Read-Only (Unassigned, Columns...) ---
    @GetMapping("/unassigned")
    public List<Task> getUnassignedTasks() {
        return taskRepository.findByAssigneeIsNull();
    }

    @GetMapping("/unassigned/{templateId}")
    public List<Task> getUnassignedTasksByTemplate(@PathVariable Long templateId) {
        return taskRepository.findByTemplateIdAndAssigneeIsNull(templateId);
    }

    @GetMapping("/columns/{templateId}")
    public List<String> getTemplateColumns(@PathVariable Long templateId) {
        List<Task> tasks = taskRepository.findByTemplateId(templateId);
        for (Task t : tasks) {
            if (t.getDynamicData() != null && !t.getDynamicData().isEmpty()) {
                return new ArrayList<>(t.getDynamicData().keySet());
            }
        }
        return new ArrayList<>();
    }

    @GetMapping("/values/{templateId}/{columnKey}")
    public List<String> getColumnValues(@PathVariable Long templateId, @PathVariable String columnKey) {
        return taskRepository.findDistinctValuesByColumn(templateId, columnKey);
    }
}