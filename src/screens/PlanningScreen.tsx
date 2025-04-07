import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useStore } from "../store/useStore";
import EmojiSelector from "../components/EmojiSelector";

const PlanningScreen: React.FC = () => {
  const { selectedTask, setSelectedTask, setTasks, tasks } = useStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false); // Estado para controlar el modo de edición
  const [editedTitle, setEditedTitle] = useState(selectedTask?.title || ""); // Estado para el título editado

  const handleEmojiSelect = (emoji: string) => {
    if (selectedTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === selectedTask.id ? { ...task, emoji } : task
      );
      setTasks(updatedTasks);
      setSelectedTask({ ...selectedTask, emoji });
    }
  };

  const handleTitleSave = () => {
    if (selectedTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === selectedTask.id ? { ...task, title: editedTitle } : task
      );
      setTasks(updatedTasks);
      setSelectedTask({ ...selectedTask, title: editedTitle });
    }
    setIsEditingTitle(false); // Salir del modo de edición
  };

  return (
    <View style={styles.container}>
      <View>
        <Text>{JSON.stringify(selectedTask)}</Text>
        {/* Emoji seleccionado que abre el modal */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.emojiText}>{selectedTask?.emoji}</Text>
        </TouchableOpacity>
        {/* Modal para seleccionar emojis */}
        <EmojiSelector
          visible={isModalVisible}
          onSelect={handleEmojiSelect}
          onClose={() => setModalVisible(false)}
        />
      </View>
      <View>
        {isEditingTitle ? (
          <TextInput
            style={styles.input}
            value={editedTitle}
            onChangeText={setEditedTitle}
            onBlur={handleTitleSave} // Guardar cambios al perder el foco
            placeholder="Nombre de la actividad" // Texto de marcador de posición
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
            <Text style={styles.titleText}>
              {selectedTask?.title || "Nombre de la actividad"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  emojiText: {
    fontSize: 128,
    textAlign: "center",
    marginBottom: 16,
  },
  titleText: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
    padding: 4,
  },
});

export default PlanningScreen;
