package com.kyntus.Workflow.service;

import com.kyntus.Workflow.model.Task;
import com.kyntus.Workflow.model.WorkflowTemplate;
import com.kyntus.Workflow.repository.TaskRepository;
import com.kyntus.Workflow.repository.WorkflowTemplateRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Service
public class ExcelImportService {

    private final TaskRepository taskRepository;
    private final WorkflowTemplateRepository templateRepository;

    public ExcelImportService(TaskRepository taskRepository, WorkflowTemplateRepository templateRepository) {
        this.taskRepository = taskRepository;
        this.templateRepository = templateRepository;
    }

    public void importExcel(MultipartFile file, Long templateId) throws IOException {
        // 1. Récupérer le Template (Le Moule)
        WorkflowTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template introuvable !"));

        // 2. Ouvrir le fichier Excel
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0); // On prend la première feuille
            Iterator<Row> rowIterator = sheet.iterator();

            // 3. Lire le Header (La première ligne) pour mapper les colonnes
            if (!rowIterator.hasNext()) {
                throw new RuntimeException("Fichier Excel vide !");
            }

            Row headerRow = rowIterator.next();
            Map<Integer, String> columnMapping = new HashMap<>();

            for (Cell cell : headerRow) {
                // On stocke l'index et le nom de la colonne (ex: 0 -> "EPS", 1 -> "Distance")
                columnMapping.put(cell.getColumnIndex(), cell.getStringCellValue().trim());
            }

            // 4. Parcourir les lignes de données
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();

                // Si la ligne est vide (première cellule vide), on saute
                if (row.getCell(0) == null || getCellValueAsString(row.getCell(0)).isEmpty()) continue;

                Task task = new Task();
                task.setTemplate(template);
                task.setStatus("A_FAIRE");

                Map<String, Object> dynamicData = new HashMap<>();

                // 5. Remplir les données dynamiques
                for (Cell cell : row) {
                    String columnName = columnMapping.get(cell.getColumnIndex());

                    if (columnName == null) continue; // Colonne inconnue

                    // Cas spécial : La colonne EPS est stockée à part pour la recherche
                    if (columnName.equalsIgnoreCase("EPS") || columnName.equalsIgnoreCase("Reference")) {
                        task.setEpsReference(getCellValueAsString(cell));
                    } else {
                        // Les autres colonnes vont dans le JSON
                        dynamicData.put(columnName, getCellValueAsString(cell));
                    }
                }

                // Sauvegarde
                task.setDynamicData(dynamicData);
                // Si pas d'EPS trouvé, on génère un ID temporaire (juste au cas où)
                if (task.getEpsReference() == null || task.getEpsReference().isEmpty()) {
                    task.setEpsReference("UNKNOWN-" + System.currentTimeMillis());
                }

                taskRepository.save(task);
            }
        }
    }

    // Helper pour lire n'importe quel type de cellule (Texte ou Nombre)
    // FIX: Remplacement du Switch par If/Else pour éviter l'erreur NoClassDefFoundError ($1)
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }

        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue();
        }
        else if (cell.getCellType() == CellType.NUMERIC) {
            // On cast en (int) pour éviter d'avoir "150.0" au lieu de "150"
            return String.valueOf((int) cell.getNumericCellValue());
        }
        else if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }
        else if (cell.getCellType() == CellType.FORMULA) {
            // Cas où la cellule est une formule, on essaie de récupérer le résultat
            try {
                return cell.getStringCellValue();
            } catch (IllegalStateException e) {
                return String.valueOf((int) cell.getNumericCellValue());
            }
        }

        return "";
    }
}