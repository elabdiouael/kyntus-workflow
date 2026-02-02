"use client";

import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { 
  BarChart3, Circle, Clock, CheckCircle2, Activity, Zap, ShieldCheck, AlertTriangle 
} from "lucide-react";

// Import du fichier CSS spécifique
import "./OperationalFlux.css";

// --- TYPES ---
interface TemplatePilotStats {
  pilotId: number;
  pilotName: string;
  avatarUrl?: string;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  validCount: number;
  errorCount: number;
  completionRate: number;
}

interface WorkflowTemplate {
  id: number;
  name: string;
}

export default function OperationalFlux() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [stats, setStats] = useState<TemplatePilotStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    setLastUpdate(new Date());
    fetch("http://localhost:8080/api/templates")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        if (data.length > 0) setSelectedTemplateId(data[0].id);
      })
      .catch((err) => console.error("Error loading templates:", err));
  }, []);

  const fetchStats = () => {
    if (!selectedTemplateId) return;
    setLoading(true);
    fetch(`http://localhost:8080/api/stats/template/${selectedTemplateId}/pilots`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
        setLastUpdate(new Date());
      })
      .catch((err) => {
        console.error("Error loading stats:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, [selectedTemplateId]);

  // --- WEBSOCKET ---
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe("/topic/workflow-events", (message) => {
          if (message.body === "TASK_UPDATE") fetchStats();
        });
      },
    });
    stompClient.activate();
    return () => stompClient.deactivate();
  }, [selectedTemplateId]);

  return (
    <div className="flux-container">
      
      {/* HEADER */}
      <div className="flux-header">
        <div className="flux-title-group">
          <h2 className="flux-title">
            <Activity className="icon-pulse" size={32} />
            <span className="gradient-text">Nexus Command</span>
          </h2>
          <div className="flux-status">
            <span className="live-indicator">
              <span className="ping"></span>
              <span className="dot"></span>
            </span>
            <p className="status-text">
              Live System • {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flux-tabs">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplateId(tmpl.id)}
              className={`tab-btn ${selectedTemplateId === tmpl.id ? "active" : ""}`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* GRID CONTENT */}
      <div className="flux-grid-wrapper">
        <div className="flux-grid">
          
          {loading && stats.length === 0 ? (
            // Skeletons
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="pilot-card skeleton" />
            ))
          ) : stats.length === 0 ? (
            <div className="no-data">
               <BarChart3 size={64} style={{ opacity: 0.2 }} />
               <p>NO DATA SIGNAL DETECTED</p>
            </div>
          ) : (
            stats.map((pilot) => (
              <div key={pilot.pilotId} className="pilot-card">
                
                {/* CARD HEADER */}
                <div className="card-header">
                  <div className="pilot-info">
                    <div className="pilot-avatar">
                      {pilot.pilotName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="pilot-details">
                      <h3>{pilot.pilotName}</h3>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${pilot.completionRate === 100 ? "complete" : ""}`}
                            style={{ width: `${pilot.completionRate}%` }}
                          />
                        </div>
                        <span className={`progress-text ${pilot.completionRate === 100 ? "complete" : ""}`}>
                          {pilot.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {pilot.completionRate >= 100 && (
                    <div className="mvp-badge">🏆 MVP</div>
                  )}
                </div>

                {/* STATS TILES */}
                <div className="stats-grid">
                  <div className="stat-box todo">
                    <div className="stat-label"><Circle size={14} /> A FAIRE</div>
                    <span className="stat-value">{pilot.todoCount}</span>
                  </div>

                  <div className={`stat-box active ${pilot.inProgressCount > 0 ? "glow" : ""}`}>
                    <div className="stat-label"><Zap size={14} /> ACTIVE</div>
                    <span className="stat-value">{pilot.inProgressCount}</span>
                  </div>

                  <div className="stat-box done">
                    <div className="stat-label"><CheckCircle2 size={14} /> DONE</div>
                    <span className="stat-value">{pilot.doneCount}</span>
                  </div>

                  <div className="stat-box valid">
                    <div className="stat-label"><ShieldCheck size={14} /> VALIDÉ</div>
                    <span className="stat-value">{pilot.validCount}</span>
                  </div>
                </div>

                {/* ALERT */}
                {pilot.errorCount > 0 && (
                  <div className="error-alert">
                    <AlertTriangle size={14} />
                    {pilot.errorCount} ANOMALIES CRITIQUES
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}