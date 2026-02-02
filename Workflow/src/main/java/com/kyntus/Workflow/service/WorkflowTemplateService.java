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

    public List<WorkflowTemplate> getAllTemplates() {
        return repository.findAll();
    }

    @Transactional
    public WorkflowTemplate createTemplate(WorkflowTemplateDto dto) {
        WorkflowTemplate template = new WorkflowTemplate();
        template.setName(dto.getName());
        template.setDescription(dto.getDescription());

        // Save Manual Complexity (Default 1 if missing)
        template.setComplexity(dto.getComplexity() > 0 ? dto.getComplexity() : 1);

        List<FieldDefinition> fields = new ArrayList<>();
        if (dto.getFields() != null) {
            for (FieldDefinitionDto fieldDto : dto.getFields()) {
                FieldDefinition field = new FieldDefinition();
                field.setName(fieldDto.getName());
                field.setType(fieldDto.getType());
                field.setRequired(fieldDto.isRequired());
                field.setWorkflowTemplate(template);
                fields.add(field);
            }
        }
        template.setFields(fields);
        return repository.save(template);
    }
}