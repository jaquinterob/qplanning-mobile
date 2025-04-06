import { Task } from "../types/Task";

export const mockTask: Task[] = [
  {
    id: "1",
    title: "Lavar los platos",
    emoji: "🍽️",
    status: "pending" as const,
    assignedTo: "Juan",
    estimatedCompletionTime: 15,
  },
  {
    id: "2",
    title: "Sacar la basura",
    emoji: "🗑️",
    status: "completed" as const,
    assignedTo: "María",
    estimatedCompletionTime: 12,
  },
  {
    id: "3",
    title: "Limpiar el baño",
    emoji: "🛁",
    status: "in-progress" as const,
    assignedTo: "Carlos",
    estimatedCompletionTime: 17,
  },
  {
    id: "4",
    title: "Cortar el césped",
  },
  {
    id: "6",
    title: "Organizar el armario",
  },
  {
    id: "7",
    title: "Organizar el armario",
  },
  {
    id: "8",
    title: "Organizar el armario",
  },
];
