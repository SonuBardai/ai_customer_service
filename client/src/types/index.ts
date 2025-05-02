export interface Bot {
  id: string;
  name: string;
  tone: string;
  company: {
    id: string;
    name: string;
  };
  knowledge_items: Array<{
    id: string;
    type: string;
    content: string;
  }>;
}

export interface BotStatus {
  id: string;
  status: 'training' | 'ready' | 'error';
  progress?: number;
  error?: string;
} 