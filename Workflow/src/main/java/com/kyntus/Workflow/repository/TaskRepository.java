package com.kyntus.Workflow.repository;

import com.kyntus.Workflow.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // --- 1. BASIC FILTERS ---
    List<Task> findByTemplateId(Long templateId);
    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByTemplateIdAndStatus(Long templateId, String status);
    Optional<Task> findByEpsReference(String epsReference);

    // --- 2. STATS ---
    int countByAssigneeIdAndStatus(Long assigneeId, String status);
    int countByAssigneeId(Long assigneeId);

    // --- 3. FIX: PILOT BOARD FILTER ---
    List<Task> findByAssigneeIdAndTemplateId(Long assigneeId, Long templateId);

    // --- 4. DISPATCHING & STREAM ---

    // Incoming Stream (Global)
    List<Task> findByAssigneeIsNull();

    // Manual Filter Stream
    List<Task> findByTemplateIdAndAssigneeIsNull(Long templateId);

    // Batch Auto Dispatch
    List<Task> findByBatchIdAndAssigneeIsNull(Long batchId);

    // --- 5. SMART FILTER QUERIES (JSONB) ---

    // A. Execute Filter: Jib tasks khawyin + filtrés par JSONB
    @Query(value = "SELECT * FROM tasks t " +
            "WHERE t.template_id = :templateId " +
            "AND t.assigned_to IS NULL " +
            "AND t.dynamic_data ->> :key = :value", // Hna fin katchof JSON
            nativeQuery = true)
    List<Task> findByTemplateAndFilter(
            @Param("templateId") Long templateId,
            @Param("key") String key,
            @Param("value") String value
    );

    // B. Dropdown Values: Jib valeurs distinctes mn JSONB
    @Query(value = "SELECT DISTINCT t.dynamic_data ->> :key FROM tasks t " +
            "WHERE t.template_id = :templateId " +
            "AND t.assigned_to IS NULL " +
            "AND t.dynamic_data ->> :key IS NOT NULL",
            nativeQuery = true)
    List<String> findDistinctValuesByColumn(
            @Param("templateId") Long templateId,
            @Param("key") String key
    );
}