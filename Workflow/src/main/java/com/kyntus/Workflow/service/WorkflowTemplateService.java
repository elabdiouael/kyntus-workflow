package com.kyntus.Workflow.service;

import com.kyntus.Workflow.dto.FieldDefinitionDto;
import com.kyntus.Workflow.dto.WorkflowTemplateDto;
import com.kyntus.Workflow.model.FieldDefinition;
import com.kyntus.Workflow.model.WorkflowTemplate;
import com.kyntus.Workflow.repository.WorkflowTemplateRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class WorkflowTemplateService {

    private final WorkflowTemplateRepository repository;

    public WorkflowTemplateService(WorkflowTemplateRepository repository) {
        this.repository = repository;
    }

    // Fonction bach njbdo koulchi
    public List<WorkflowTemplate> getAllTemplates() {
        return repository.findAll();
    }

    // Fonction bach ncréiw Template jdid + Les Champs dyalo
    @Transactional // Bach koulchi ydouz d9a we7da (All or Nothing)
    public WorkflowTemplate createTemplate(WorkflowTemplateDto dto) {
        // 1. Convertir DTO -> Entity (Template)
        WorkflowTemplate template = new WorkflowTemplate();
        template.setName(dto.getName());
        template.setDescription(dto.getDescription());

        // 2. Gérer les champs (FieldDefinitions)
        List<FieldDefinition> fields = new ArrayList<>();
        if (dto.getFields() != null) {
            for (FieldDefinitionDto fieldDto : dto.getFields()) {
                FieldDefinition field = new FieldDefinition();
                field.setName(fieldDto.getName());
                field.setType(fieldDto.getType());
                field.setRequired(fieldDto.isRequired());
                field.setWorkflowTemplate(template); // Liaison
                fields.add(field);
            }
        }

        template.setFields(fields);

        // 3. Sauvegarder f Base de Données
        return repository.save(template);
    }
}