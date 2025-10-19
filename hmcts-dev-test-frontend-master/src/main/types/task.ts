export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate: string; // ISO date string from backend
}