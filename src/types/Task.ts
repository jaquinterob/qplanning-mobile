import { ColorEnum } from "../enums/ColorEnum";

export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Activity {
  id: string;
  title: string;
  completed: boolean;
}
export interface Task extends Activity {
  emoji?: string;
  color?: string; 
  assignedTo?: string;
  estimatedCompletionTime?: number; // in minutes
}
