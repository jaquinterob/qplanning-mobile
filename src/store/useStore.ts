import { create } from "zustand";
import { Task } from "../types/Task";

interface StoreState {
  tasks: Task[];
  selectedTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  setSelectedTask: (task: Task) => void;
}

export const useStore = create<StoreState>((set) => ({
  tasks: [],
  selectedTask: null,
  setTasks: (tasks) => set({ tasks }),
  setSelectedTask: (task) => set({ selectedTask: task }),
}));
