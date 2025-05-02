import axios from 'axios';
import { BACKEND_URL } from 'Shared/constants';

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
    type: 'url' | 'file' | 'text';
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

export const getCompany = async (): Promise<Company | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/company`);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
};

export const updateCompany = async (config: CompanyConfig) => {
  const formData = new FormData();
  formData.append('name', config.name);
  if (config.primary_color) formData.append('primary_color', config.primary_color);
  if (config.secondary_color) formData.append('secondary_color', config.secondary_color);
  if (config.logo) formData.append('logo', config.logo);

  const response = await axios.post(`${API_BASE_URL}/company`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createBot = async (config: BotConfig) => {
  const response = await axios.post(`${API_BASE_URL}/bot`, config);
  return response.data;
}; 
