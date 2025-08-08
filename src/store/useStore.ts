import { create } from "zustand";
import { Task } from "../types/Task";

interface StoreState {
  tasks: Task[];
  selectedTask: Task | null;
  showToast: boolean;
  toastMessage: string;
  setTasks: (tasks: Task[]) => void;
  setSelectedTask: (task: Task) => void;
  setToast: (show: boolean, message: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  tasks: [],
  selectedTask: null,
  showToast: false,
  toastMessage: "",
  setTasks: (tasks) => set({ tasks }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setToast: (show, message) => set({ showToast: show, toastMessage: message }),
}));
