package com.kyntus.Workflow.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class WorkflowTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    // 🔥 FIX: Rje3na l FieldDefinition Entity (Relation S7i7a)
    // MappedBy "workflowTemplate" ya3ni FieldDefinition 3ndo champ smiyto workflowTemplate
    @OneToMany(mappedBy = "workflowTemplate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference // Bach myw93ch boucle infini f JSON
    @ToString.Exclude
    private List<FieldDefinition> fields = new ArrayList<>();

    // Helper method bach tzid field sahla
    public void addField(FieldDefinition field) {
        fields.add(field);
        field.setWorkflowTemplate(this);
    }
}