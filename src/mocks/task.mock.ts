
import { DEFAULT_EMOJI } from "../constants/constants";
import { TaskCardColors } from "../enums/task-card-colors";
import { Task } from "../types/Task";

export const mockTask: Task[] = [
  {
    id: "1",
    title: "Lavar los platos",
    completed: true,
    emoji: "🍽️",
    assignedTo: "Juan",
    estimatedCompletionTime: 15,
    color: TaskCardColors.Default,
  },
  {
    id: "2",
    title: "Sacar la basura",
    completed: false,
    emoji: "🗑️",
    assignedTo: "María",
    estimatedCompletionTime: 12,
    color: TaskCardColors.Default,
  },
  {
    id: "3",
    title: "Limpiar el baño",
    completed: false,
    emoji: "🛁",
    assignedTo: "Carlos",
    estimatedCompletionTime: 17,
    color: TaskCardColors.Default,
  },
  {
    id: "4",
    title: "Cortar el césped",
    completed: false,
    emoji: DEFAULT_EMOJI,
    color: TaskCardColors.Yellow,
  },
  {
    id: "6",
    title: "Organizar el armario",
    completed: false,
    emoji: DEFAULT_EMOJI,
    color: TaskCardColors.Default,
  },
  {
    id: "7",
    title: "Organizar el armario",
    completed: false,
    emoji: DEFAULT_EMOJI,
    color: TaskCardColors.Default,
  },
  {
    id: "8",
    title: "Organizar el armario",
    completed: false,
    emoji: DEFAULT_EMOJI,
    color: TaskCardColors.Default,
  },
];
