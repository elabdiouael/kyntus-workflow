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

    // Z-AXIS CONTROL (1 to 10)
    // Default 1 (Simple)
    @Column(nullable = false, columnDefinition = "int default 1")
    private int complexity = 1;

    @OneToMany(mappedBy = "workflowTemplate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @ToString.Exclude
    private List<FieldDefinition> fields = new ArrayList<>();

    public void addField(FieldDefinition field) {
        fields.add(field);
        field.setWorkflowTemplate(this);
    }
}