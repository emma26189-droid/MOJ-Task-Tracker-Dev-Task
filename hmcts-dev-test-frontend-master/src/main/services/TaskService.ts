import axios from 'axios';
import type { Task } from '../types/task';
import type { TaskCounter } from '../types/taskCounter';

const API_BASE_URL = 'http://localhost:4000/api/tasks';
let taskCounter = { currentNumber: 0 };

export const TaskService = {
  async getAllTasks(): Promise<Task[]> {
    const response = await axios.get<Task[]>(API_BASE_URL);
    // Update the counter to be the highest task number
    taskCounter.currentNumber = Math.max(
      ...response.data.map(task => task.taskNumber || 0),
      taskCounter.currentNumber
    );
    return response.data;
  },

  async getTask(id: string | number): Promise<Task> {
    const response = await axios.get<Task>(`${API_BASE_URL}/${encodeURIComponent(String(id))}`);
    return response.data;
  },

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    // Increment the task number
    taskCounter.currentNumber++;
    const taskWithNumber = {
      ...task,
      taskNumber: taskCounter.currentNumber
    };
    const response = await axios.post<Task>(API_BASE_URL, taskWithNumber);
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