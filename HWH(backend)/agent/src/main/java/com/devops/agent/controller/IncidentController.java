package com.devops.agent.controller;

import com.devops.agent.dto.IncidentRequestDto;
import com.devops.agent.entity.Incident;
import com.devops.agent.repository.IncidentRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentRepository incidentRepository;

    public IncidentController(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    // =========================
    // CREATE INCIDENT + AI ANALYSIS
    // POST /api/incidents
    // =========================
    @PostMapping
    public ResponseEntity<Map<String, Object>> createIncident(
            @RequestBody IncidentRequestDto request) {

        // Create incident
        Incident incident = new Incident();
        incident.setService(request.getService());
        incident.setErrorCode(request.getErrorCode());
        incident.setDescription(request.getDescription());
        incident.setStatus("OPEN");
        incident.setCreatedAt(LocalDateTime.now());

        // Save to PostgreSQL
        Incident savedIncident = incidentRepository.save(incident);

        // Call FastAPI AI Agent
        RestTemplate restTemplate = new RestTemplate();

        Map<String, String> aiRequest = new HashMap<>();
        aiRequest.put("incident_id", String.valueOf(savedIncident.getId()));
        aiRequest.put("service", savedIncident.getService());
        aiRequest.put("error", savedIncident.getDescription());

        Object aiResponse;

        try {
            aiResponse = restTemplate.postForObject(
                    "http://127.0.0.1:8000/incidents/analyze",
                    aiRequest,
                    Object.class
            );
        } catch (Exception e) {
            aiResponse = Map.of(
                    "message", "AI service unavailable",
                    "error", e.getMessage()
            );
        }

        Map<String, Object> response = new HashMap<>();
        response.put("incident", savedIncident);
        response.put("ai", aiResponse);

        return ResponseEntity.ok(response);
    }

    // =========================
    // GET ALL INCIDENTS
    // GET /api/incidents
    // =========================
    @GetMapping
    public ResponseEntity<?> getAllIncidents() {
        return ResponseEntity.ok(incidentRepository.findAll());
    }

    // =========================
    // GET INCIDENT BY ID
    // GET /api/incidents/{id}
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable Long id) {
        return incidentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================
    // UPDATE INCIDENT
    // PUT /api/incidents/{id}
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<Incident> updateIncident(
            @PathVariable Long id,
            @RequestBody IncidentRequestDto request) {

        return incidentRepository.findById(id)
                .map(incident -> {

                    incident.setService(request.getService());
                    incident.setErrorCode(request.getErrorCode());
                    incident.setDescription(request.getDescription());

                    Incident updatedIncident = incidentRepository.save(incident);

                    return ResponseEntity.ok(updatedIncident);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================
    // DELETE INCIDENT
    // DELETE /api/incidents/{id}
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {

        if (!incidentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        incidentRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}