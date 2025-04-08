import { TaskCardColors } from "../enums/task-card-colors";

export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Activity {
  id: string;
  title: string;
  completed: boolean;
  color: TaskCardColors;
}
export interface Task extends Activity {
  emoji?: string;
  assignedTo?: string;
  estimatedCompletionTime?: number; // in minutes
}
