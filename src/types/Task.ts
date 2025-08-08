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
  timerStarted?: boolean;
  timerStartTime?: number; // timestamp
  timerPaused?: boolean;
  elapsedTime?: number; // milliseconds elapsed when paused
  isOverdue?: boolean;
  actualCompletionTime?: number; // tiempo real que tomó completar la tarea (en milisegundos)
}
