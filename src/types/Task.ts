export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Activity {
  id: string;
  title: string;
}
export interface Task extends Activity {
  emoji?: string;
  status?: TaskStatus;
  assignedTo?: string;
  estimatedCompletionTime?: number; // in minutes
}
