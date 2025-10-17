import axios from 'axios';
import type { Task } from '../types/task';

const API_BASE_URL = 'http://localhost:4000/api/tasks';

export const TaskService = {
  async getAllTasks(): Promise<Task[]> {
    const response = await axios.get<Task[]>(API_BASE_URL);
    return response.data;
  },

  async getTask(id: string | number): Promise<Task> {
    const response = await axios.get<Task>(`${API_BASE_URL}/${encodeURIComponent(String(id))}`);
    return response.data;
  },

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const response = await axios.post<Task>(API_BASE_URL, task);
    return response.data;
  },

  async updateTaskStatus(id: string | number, status: string): Promise<Task> {
    const response = await axios.patch<Task>(
      `${API_BASE_URL}/${encodeURIComponent(String(id))}/status`,
      { status }
    );
    return response.data;
  },

  async deleteTask(id: string | number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${encodeURIComponent(String(id))}`);
  }
};