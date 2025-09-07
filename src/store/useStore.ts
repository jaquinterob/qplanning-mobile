import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types/Task";

interface StoreState {
  tasks: Task[];
  selectedTask: Task | null;
  showToast: boolean;
  toastMessage: string;
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  setSelectedTask: (task: Task) => void;
  setToast: (show: boolean, message: string) => void;
  loadTasks: () => Promise<void>;
  saveTasks: (tasks: Task[]) => Promise<void>;
}

const STORAGE_KEY = "@qplanning_tasks";

export const useStore = create<StoreState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  showToast: false,
  toastMessage: "",
  isLoading: true,
  
  setTasks: async (tasks) => {
    set({ tasks });
    // Guardar automáticamente cuando se actualizan las tareas
    await get().saveTasks(tasks);
  },
  
  setSelectedTask: (task) => set({ selectedTask: task }),
  
  setToast: (show, message) => set({ showToast: show, toastMessage: message }),
  
  loadTasks: async () => {
    try {
      set({ isLoading: true });
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        set({ tasks, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
      set({ isLoading: false });
    }
  },
  
  saveTasks: async (tasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error guardando tareas:", error);
    }
  },
}));
