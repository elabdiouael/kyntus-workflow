// src/lib/translations.ts

export type Language = "fr" | "en";

export const translations = {
  fr: {
    sidebar: {
      command: "Centre de Commande",
      dispatch: "Dispatching Tâches",
      tactical: "Tableau Tactique",
      inspector: "Inspecteur (Audit)",
      omni: "Omni-Grid (Data)",
      export: "Extraction Données",
      import: "Injection Données",
      team: "Ops Équipe",
      config: "Config Système",
      logout: "Déconnexion"
    },
    status: {
      pending: "En Attente",
      active: "En Cours",
      done: "À Valider",
      valid: "Validé",
      rejected: "Rejeté"
    },
    common: {
      loading: "Chargement...",
      error: "Erreur Système",
      success: "Opération Réussie",
      refresh: "Actualiser",
      cancel: "Annuler",
      confirm: "Confirmer"
    }
  },
  en: {
    sidebar: {
      command: "Command Center",
      dispatch: "Task Dispatch",
      tactical: "Tactical Board",
      inspector: "Inspector (Audit)",
      omni: "Omni-Grid (Data)",
      export: "Data Extraction",
      import: "Data Injection",
      team: "Team Ops",
      config: "System Config",
      logout: "Disconnect"
    },
    status: {
      pending: "Pending",
      active: "Active",
      done: "To Validate",
      valid: "Secured",
      rejected: "Rejected"
    },
    common: {
      loading: "Loading...",
      error: "System Error",
      success: "Operation Successful",
      refresh: "Refresh",
      cancel: "Cancel",
      confirm: "Confirm"
    }
  }
};