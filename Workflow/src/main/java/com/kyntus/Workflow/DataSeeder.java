package com.kyntus.Workflow;

import com.kyntus.Workflow.model.*;
import com.kyntus.Workflow.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private final TaskRepository taskRepository;
    private final WorkflowTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final PointLogRepository pointLogRepository;

    public DataSeeder(TaskRepository taskRepo, WorkflowTemplateRepository templRepo,
                      UserRepository userRepo, PointLogRepository pointLogRepo) {
        this.taskRepository = taskRepo;
        this.templateRepository = templRepo;
        this.userRepository = userRepo;
        this.pointLogRepository = pointLogRepo;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("⚠️ DB déjà initialisée. Skipping Seeder.");
            return;
        }

        System.out.println("🚀 INITIALISATION DU SYSTÈME KYNTUS (MODE NASA)...");

        // 1. ADMIN
        User admin = createUser("elabdi", "admin123", Role.ADMIN);

        // 2. LES 11 PILOTES (L'Escadron)
        String[] pilotNames = {
                "Saad", "Karim", "Amine", "Reda", "Youssef",
                "Hicham", "Bilal", "Mehdi", "Omar", "Khalid", "Anas"
        };

        List<User> pilots = new ArrayList<>();
        for (String name : pilotNames) {
            pilots.add(createUser(name.toLowerCase(), name.toLowerCase() + "123", Role.PILOT));
        }

        // 3. TEMPLATES
        WorkflowTemplate fibre = createTemplate("Raccordement Fibre (D3)", "FTTH Oujda & Berkane");
        addField(fibre, "PBO", "TEXT", true);
        addField(fibre, "Signal (dB)", "NUMBER", true);
        addField(fibre, "Adresse", "TEXT", true);
        templateRepository.save(fibre);

        WorkflowTemplate solaire = createTemplate("Installation Solaire", "Panneaux PV & Onduleurs");
        addField(solaire, "Puissance (kW)", "NUMBER", true);
        addField(solaire, "Orientation", "SELECT", false);
        templateRepository.save(solaire);

        WorkflowTemplate audit = createTemplate("Audit Qualité Réseau", "Vérification conformité");
        addField(audit, "Zone", "TEXT", true);
        addField(audit, "Anomalie", "TEXT", false);
        templateRepository.save(audit);

        // 4. GÉNÉRATION MASIVE DE TÂCHES (Simulation Réaliste)
        Random rand = new Random();
        List<Task> tasks = new ArrayList<>();

        // A. Tâches pour le DISPATCH (Non assignées)
        for (int i = 0; i < 50; i++) {
            tasks.add(createTask(fibre, null, "EPS-FIB-" + (1000 + i), "A_FAIRE",
                    Map.of("PBO", "PBO-XX-" + i, "Signal (dB)", -15 - rand.nextInt(10), "Adresse", "Hay Quds " + i), null));
        }

        // B. Tâches pour CHAQUE PILOTE (Historique & En Cours)
        for (User pilot : pilots) {
            // Chaque pilote a entre 20 et 50 tâches
            int taskCount = 20 + rand.nextInt(30);

            for (int i = 0; i < taskCount; i++) {
                String status = getRandomStatus(rand);
                WorkflowTemplate tmpl = rand.nextBoolean() ? fibre : (rand.nextBoolean() ? solaire : audit);

                // Simulation du temps (Entre 5min et 60min)
                Long timeSeconds = null;
                if (!status.equals("A_FAIRE")) {
                    timeSeconds = 300L + rand.nextInt(3300);
                }

                // Génération Data
                Map<String, Object> data = new HashMap<>();
                if (tmpl == fibre) data.put("PBO", "PBO-" + rand.nextInt(999));
                else if (tmpl == solaire) data.put("Puissance (kW)", 3 + rand.nextInt(10));
                else data.put("Zone", "Secteur " + rand.nextInt(5));

                Task t = createTask(tmpl, pilot, "EPS-" + pilot.getUsername().substring(0,2).toUpperCase() + "-" + i, status, data, timeSeconds);

                // Simulation d'erreurs (Les pilotes du bas de liste font plus de fautes)
                if (status.equals("REJETE") && rand.nextInt(10) > 5) {
                    t.setFlaggedError(true);
                    pilot.setErrorCount(pilot.getErrorCount() + 1);
                }
                tasks.add(t);
            }
            userRepository.save(pilot); // Save error count
        }

        // 5. BONUS/MALUS (VAR)
        // Saad est fort, on lui donne un bonus
        pilots.get(0).setManualPoints(150); // Saad
        createLog(pilots.get(0), admin, 150, "Excellent performance en Janvier");

        // Amine a fait une bêtise
        pilots.get(2).setManualPoints(-50); // Amine
        createLog(pilots.get(2), admin, -50, "Retard sur le chantier PBO-12");

        userRepository.saveAll(pilots);
        taskRepository.saveAll(tasks);

        System.out.println("✅ " + tasks.size() + " tâches générées.");
        System.out.println("🏁 SYSTEM READY. 11 Pilotes opérationnels.");
    }

    // --- HELPERS ---

    private String getRandomStatus(Random r) {
        int chance = r.nextInt(100);
        if (chance < 10) return "A_FAIRE";
        if (chance < 25) return "EN_COURS";
        if (chance < 35) return "DONE"; // A Valider
        if (chance < 90) return "VALIDE"; // Majorité validée
        return "REJETE";
    }

    private User createUser(String username, String password, Role role) {
        User u = new User();
        u.setUsername(username);
        u.setPassword(password);
        u.setRole(role);
        u.setActive(true);
        return userRepository.save(u);
    }

    private WorkflowTemplate createTemplate(String name, String desc) {
        WorkflowTemplate t = new WorkflowTemplate();
        t.setName(name);
        t.setDescription(desc);
        return t;
    }

    private void addField(WorkflowTemplate tmpl, String name, String type, boolean req) {
        FieldDefinition fd = new FieldDefinition();
        fd.setName(name);
        fd.setType(type);
        fd.setRequired(req);
        tmpl.addField(fd);
    }

    private Task createTask(WorkflowTemplate tmpl, User assignee, String eps, String status, Map<String, Object> data, Long time) {
        Task t = new Task();
        t.setTemplate(tmpl);
        t.setAssignee(assignee);
        t.setEpsReference(eps);
        t.setStatus(status);
        t.setDynamicData(data);
        t.setImportedAt(LocalDateTime.now().minusDays(new Random().nextInt(10)));
        t.setCumulativeTimeSeconds(time);
        return t;
    }

    private void createLog(User pilot, User admin, int pts, String reason) {
        PointLog log = new PointLog();
        log.setPilot(pilot);
        log.setAdmin(admin);
        log.setPoints(pts);
        log.setReason(reason);
        log.setCreatedAt(LocalDateTime.now());
        pointLogRepository.save(log);
    }
}