import React, { useState } from "react";
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
import { Task } from "../types/Task";
import { useNavigation, NavigationProp } from "@react-navigation/native";

export type RootStackParamList = {
  Home: undefined;
  Planning: undefined;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [tasks, setTasks] = useState<Task[]>([
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
  ]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleTaskPress = (taskId: string) => {
    console.log("Task pressed:", taskId);
  };

  const handleAddTaskPress = () => {
    setModalVisible(true);
  };

  const handleSaveTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: (tasks.length + 2).toString(),
        title: newTaskTitle,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setModalVisible(false);
    }
  };

  const handleSavePlanning = (task: Task) => {
    navigation?.navigate("Planning");
    navigation.navigate("Planning");
    console.log("Navegando a PlanningScreen para la tarea:", task.id);
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
              <TaskCard
                task={item}
                onLognPress={() => handleSavePlanning(item)}
              />
            )}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
      {tasks.some((task) => task.status) && (
        <>
          <FlatList
            data={tasks.filter((task) => task.status)}
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

      {/* Modal para agregar nueva actividad */}
      <Modal
        visible={isModalVisible}
        animationType="none" // Sin animación
        transparent={true} // Fondo sólido
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
