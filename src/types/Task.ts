export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  emoji: string;
  status: TaskStatus;
  assignedTo: string;
} 