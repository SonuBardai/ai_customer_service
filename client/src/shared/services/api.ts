import axios from "axios";
import { BACKEND_URL } from "Shared/constants";

const API_BASE_URL = `${BACKEND_URL}/rest/v1`;

export interface CompanyConfig {
  name: string;
  primary_color?: string;
  secondary_color?: string;
  logo?: File;
}

export interface BotConfig {
  company_id: number;
  name?: string;
  tone?: string;
  knowledge_items?: {
    type: "url" | "file" | "text";
    content: string;
  }[];
}

export interface Company {
  id: number;
  name: string;
  primary_color: string;
  secondary_color: string;
  logo?: string;
}

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
  status: string;
  primary_color: string;
  secondary_color: string;
}

interface PollingItem {
  id: number;
  status: string;
  completed: boolean;
  error: string | null;
  success: boolean | null;
  created_at: string;
  updated_at: string;
}

interface PollingResponse {
  bot: Bot;
  pollings: PollingItem[];
}

export const getCompany = async (): Promise<Company | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/company`);
    return response.data || null;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
};

export const updateCompany = async (config: CompanyConfig) => {
  const formData = new FormData();
  formData.append("name", config.name);
  if (config.primary_color) formData.append("primary_color", config.primary_color);
  if (config.secondary_color) formData.append("secondary_color", config.secondary_color);
  if (config.logo) formData.append("logo", config.logo);

  const response = await axios.post(`${API_BASE_URL}/company`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const createBot = async (config: BotConfig) => {
  const response = await axios.post(`${API_BASE_URL}/bot`, config);
  return response.data;
};

export const listBots = async (): Promise<Bot[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bots`);
    return response.data.map((bot: any) => ({
      ...bot,
      status: "ready",
      primary_color: "#4F46E5",
      secondary_color: "#10B981",
    }));
  } catch (error) {
    console.error("Error listing bots:", error);
    throw error;
  }
};

export const getBotStatus = async (botId: string): Promise<PollingResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bot/${botId}/status`);
    return response.data;
  } catch (error) {
    console.error("Error getting bot status:", error);
    throw error;
  }
};

export const getBot = async (botId: string): Promise<Bot> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bot/${botId}`);
    return {
      ...response.data,
      status: "ready",
      primary_color: "#4F46E5",
      secondary_color: "#10B981",
    };
  } catch (error) {
    console.error("Error getting bot:", error);
    throw error;
  }
};
