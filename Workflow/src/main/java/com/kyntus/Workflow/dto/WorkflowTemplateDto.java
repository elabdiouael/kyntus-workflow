package com.kyntus.Workflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class WorkflowTemplateDto {
    private String name; // ex: "Construction 2026"
    private String description;
    private List<FieldDefinitionDto> fields; // Liste des colonnes
}