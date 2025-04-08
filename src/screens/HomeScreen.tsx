import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import TaskCard from "../components/TaskCard";
import type { Task } from "../types/Task"; // Ensure this is the correct Task type
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { mockTask } from "../mocks/task.mock";
import { useStore } from "../store/useStore";
import { DEFAULT_EMOJI } from "../constants/constants";
import { TaskCardColors } from "../enums/task-card-colors";

export type RootStackParamList = {
  Home: undefined;
  Planning: undefined;
};

const HomeScreen: React.FC = () => {
  const { tasks, setTasks, setSelectedTask, selectedTask } = useStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const getTasks = () => {
    setTasks(mockTask);
  };

  const handleAddTaskPress = () => {
    setModalVisible(true);
  };

  const handleSaveTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: (tasks.length + 2).toString(),
        title: newTaskTitle,
        completed: false,
        emoji: DEFAULT_EMOJI,
        color: TaskCardColors.Default,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setModalVisible(false);
    }
  };

  const handleSavePlanning = (task: Task) => {
    setSelectedTask(task);
    navigation?.navigate("Planning");
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <View style={styles.container}>
      {tasks.some((task) => !task.assignedTo) && (
        <>
          <Text style={styles.title}>Lista de actividades sin planear</Text>
          <FlatList
            data={tasks.filter((task) => !task.assignedTo)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onLongPress={() => handleSavePlanning(item)}
              />
            )}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
      {tasks.some((task) => task.assignedTo) && (
        <>
          <FlatList
            data={tasks.filter((task) => task.assignedTo)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TaskCard task={item} />}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddTaskPress}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
      <Modal
        visible={isModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar nueva actividad</Text>
            <TextInput
              style={styles.input}
              placeholder="Título de la actividad"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="Guardar" onPress={handleSaveTask} />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 10,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingButtonText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    color: "#555",
  },
});

export default HomeScreen;
