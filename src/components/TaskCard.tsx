import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { Task } from "../types/Task";
import { colors } from "../theme/colors";

interface TaskCardProps {
  task: Task;
  onLongPress?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onLongPress }) => {
  const hasOptionalProperties =
    task.emoji || task.assignedTo || task.estimatedCompletionTime;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        task.completed && { opacity: 0.5 },
        { backgroundColor: task.color },
      ]}
      onLongPress={onLongPress}
    >
      <View style={styles.content}>
        {hasOptionalProperties ? (
          <View style={styles.mainContent}>
            {/* Emoji container */}
            {task.emoji && (
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{task.emoji}</Text>
              </View>
            )}

            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.title,
                  task.completed && {
                    textDecorationLine: "line-through",
                    color: colors.text.secondary,
                  },
                ]}
              >
                {task.title}
              </Text>

              {task.assignedTo && (
                <Text style={styles.assignedTo}>👤 {task.assignedTo}</Text>
              )}
              {task.estimatedCompletionTime && (
                <Text style={styles.estimatedCompletionTime}>
                  🕒: {task.estimatedCompletionTime} Minutos
                </Text>
              )}
            </View>
          </View>
        ) : (
          <Text style={styles.title}>{task.title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
    backgroundColor: "#FFFFFF", // Fondo blanco fijo
  },
  content: {
    flex: 1,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "left",
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
    backgroundColor: "#F5F5F5", // Fondo gris muy claro
    marginRight: 16,
  },
  emoji: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 8,
  },
  estimatedCompletionTime: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
  completedContainer: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#DFF2BF", // Fondo verde claro para el check
    alignSelf: "flex-start",
  },
  completedText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4F8A10", // Texto verde oscuro
  },
});

export default TaskCard;
