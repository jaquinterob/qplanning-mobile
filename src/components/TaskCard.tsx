import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Task, TaskStatus } from "../types/Task";
import { colors } from "../theme/colors";

interface TaskCardProps {
  task: Task;
  onLognPress?: () => void;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "in-progress":
      return "#FFD700";
    case "completed":
      return colors.blue.primary;
    default:
      return "#9E9E9E";
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onLognPress }) => {
  const statusColor = getStatusColor(task.status ?? "pending");

  const hasOptionalProperties =
    task.emoji ||
    task.status ||
    task.assignedTo ||
    task.estimatedCompletionTime;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: statusColor }]}
      onLongPress={onLognPress}
    >
      <View style={styles.content}>
        {hasOptionalProperties ? (
          <View style={styles.mainContent}>
            {/* Emoji container */}
            {task.emoji && (
              <View
                style={[styles.emojiContainer, { borderColor: statusColor }]}
              >
                <Text style={styles.emoji}>{task.emoji}</Text>
              </View>
            )}

            <View style={styles.taskInfo}>
                <Text
                style={[
                  styles.title,
                  task.status === "completed" && { textDecorationLine: "line-through" },
                ]}
                >
                {task.title}
                </Text>

              <View style={styles.statusContainer}>
                {task.status && (
                  <View
                    style={[styles.status, { backgroundColor: statusColor }]}
                  >
                    <Text style={styles.statusText}>
                      {task.status === "in-progress"
                        ? "En progreso"
                        : task.status === "completed"
                        ? "Completado"
                        : "Pendiente"}
                    </Text>
                  </View>
                )}

                {task.assignedTo && (
                  <Text style={styles.assignedTo}>👤 {task.assignedTo}</Text>
                )}
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.title}>{task.title}</Text>
        )}

        {task.estimatedCompletionTime && (
          <Text style={styles.estimatedCompletionTime}>
            Tiempo: {task.estimatedCompletionTime} Minutos
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 6,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    flexDirection: "row", // Alinea los elementos en fila
    alignItems: "center",
  },
  taskInfo: {
    flex: 1,
    marginLeft: 16, // Agrega margen izquierdo para separar del emoji
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  status: {
    padding: 4,
    borderRadius: 4,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  assignedTo: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: "transparent",
    marginRight: 16, // Espacio entre el emoji y el contenido
  },
  emoji: {
    fontSize: 32,
  },
  estimatedCompletionTime: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
});

export default TaskCard;
