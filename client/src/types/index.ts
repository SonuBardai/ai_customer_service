export interface KnowledgeItem {
  id: string;
  type: string;
  content: string;
}

export interface Bot {
  id: string;
  name: string;
  tone: string;
  status: "training" | "ready" | "error";
  primary_color: string;
  secondary_color: string;
  logo?: string;
  knowledge_items: KnowledgeItem[];
}

export interface BotStatus {
  id: string;
  status: "training" | "ready" | "error";
  progress?: number;
  error?: string;
}
