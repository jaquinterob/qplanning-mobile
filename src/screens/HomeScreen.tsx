import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import TaskCard from "../components/TaskCard";
import { Activity, Task } from "../types/Task";

const HomeScreen: React.FC = () => {
  const tasks: Task[] = [
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

  const handleTaskPress = (taskId: string) => {
    console.log("Task pressed:", taskId);
  };

  return (
    <View style={styles.container}>
      {tasks.some((task) => !task.status) && (
        <>
          <Text style={styles.title}>Lista de actividades sin planear</Text>
          <FlatList
            data={tasks.filter((task) => !task.status)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard task={item} onPress={() => handleTaskPress(item.id)} />
            )}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}

      <View style={{ height: 1, backgroundColor: "#ccc" }} />

      {tasks.some((task) => task.status) && (
        <>
          <FlatList
            data={tasks.filter((task) => task.status)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard task={item} onPress={() => handleTaskPress(item.id)} />
            )}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 16,
  },
});

export default HomeScreen;
