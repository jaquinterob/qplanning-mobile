import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { useFamilyStore } from "../store/useFamilyStore";
import EmojiSelector from "../components/EmojiSelector";
import { TaskCardColors } from "../enums/task-card-colors";
import ColorSelector from "../components/ColorSelector";

const PlanningScreen: React.FC = () => {
  const { selectedTask, setSelectedTask, setTasks, tasks, setToast } = useStore();
  const { familyMembers } = useFamilyStore();
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(selectedTask?.title || "");
  const [assignedTo, setAssignedTo] = useState(selectedTask?.assignedTo || "");
  const [estimatedTime, setEstimatedTime] = useState(
    selectedTask?.estimatedCompletionTime?.toString() || ""
  );

  // Actualizar estados locales cuando cambie la tarea seleccionada
  React.useEffect(() => {
    if (selectedTask) {
      setEditedTitle(selectedTask.title || "");
      setAssignedTo(selectedTask.assignedTo || "");
      setEstimatedTime(selectedTask.estimatedCompletionTime?.toString() || "");
    }
  }, [selectedTask]);

  // Obtener miembros activos de la configuración
  const activeFamilyMembers = familyMembers.filter(member => member.isActive);

  const quickTimeOptions = [
    { label: "15 min", value: 15, emoji: "⚡" },
    { label: "30 min", value: 30, emoji: "⏰" },
    { label: "45 min", value: 45, emoji: "🕒" },
    { label: "1 hora", value: 60, emoji: "⏳" }
  ];

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
    setIsEditingTitle(false);
  };

  const handleAssignedToSave = () => {
    if (selectedTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === selectedTask.id ? { ...task, assignedTo } : task
      );
      setTasks(updatedTasks);
      setSelectedTask({ ...selectedTask, assignedTo });
    }
  };

  const handleFamilyMemberSelect = (member: string) => {
    setAssignedTo(member);
    if (selectedTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === selectedTask.id ? { ...task, assignedTo: member } : task
      );
      setTasks(updatedTasks);
      setSelectedTask({ ...selectedTask, assignedTo: member });
    }
  };

  const handleQuickTimeSelect = (minutes: number) => {
    setEstimatedTime(minutes.toString());
    if (selectedTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === selectedTask.id 
          ? { ...task, estimatedCompletionTime: minutes } 
          : task
      );
      setTasks(updatedTasks);
      setSelectedTask({ ...selectedTask, estimatedCompletionTime: minutes });
    }
  };

  const handleEstimatedTimeSave = () => {
    if (selectedTask) {
      const timeInMinutes = parseInt(estimatedTime) || 0;
      const updatedTasks = tasks.map((task) =>
        task.id === selectedTask.id 
          ? { ...task, estimatedCompletionTime: timeInMinutes } 
          : task
      );
      setTasks(updatedTasks);
      setSelectedTask({ ...selectedTask, estimatedCompletionTime: timeInMinutes });
    }
  };

  const onSelectColor = (color: TaskCardColors) => {
    if (selectedTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === selectedTask.id ? { ...task, color } : task
      );
      setTasks(updatedTasks);
      setSelectedTask({ ...selectedTask, color });
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
  };

  // Función para generar un color más intenso para el indicador
  const getIntenseColor = (baseColor: string): string => {
    // Usar siempre el color morado coherente con el resto de la app
    return '#6366F1';
  };

  // Verificar si la planeación está completa
  const isPlanningComplete = selectedTask?.title && selectedTask?.assignedTo && selectedTask?.estimatedCompletionTime;

  const handlePlanningComplete = () => {
    if (isPlanningComplete) {
      navigation.navigate("Home" as never);
      setTimeout(() => {
        const isEditing = selectedTask?.assignedTo; // Si ya tenía responsable, es edición
        const message = isEditing 
          ? `📝 "${selectedTask?.title}" actualizada exitosamente`
          : `✨ "${selectedTask?.title}" planeada exitosamente`;
        setToast(true, message);
        setTimeout(() => {
          setToast(false, "");
        }, 3000);
      }, 500);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: selectedTask?.color }}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color de la actividad</Text>
          <ColorSelector onSelect={onSelectColor} />
        </View>

        <View style={[styles.section, { borderColor: selectedTask?.color }]}>
          <Text style={styles.sectionTitle}>Emoji de la actividad</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.emojiText}>{selectedTask?.emoji || "📝"}</Text>
          </TouchableOpacity>
          <EmojiSelector
            visible={isModalVisible}
            onSelect={handleEmojiSelect}
            onClose={() => setModalVisible(false)}
          />
        </View>

        <View style={[styles.section, { borderColor: selectedTask?.color }]}>
          <Text style={styles.sectionTitle}>Nombre de la actividad</Text>
          {isEditingTitle ? (
            <TextInput
              style={styles.input}
              value={editedTitle}
              onChangeText={setEditedTitle}
              onBlur={handleTitleSave}
              placeholder="Nombre de la actividad"
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

        <View style={[styles.section, { borderColor: selectedTask?.color }]}>
          <Text style={styles.sectionTitle}>Responsable de la actividad</Text>
          
          {/* Botones de miembros de la familia */}
          <View style={styles.familyButtonsContainer}>
            {activeFamilyMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.familyButton,
                  assignedTo === member.name && styles.familyButtonSelected
                ]}
                onPress={() => handleFamilyMemberSelect(member.name)}
              >
                <Text style={styles.familyButtonEmoji}>
                  {member.emoji}
                </Text>
                <Text style={[
                  styles.familyButtonText,
                  assignedTo === member.name && styles.familyButtonTextSelected
                ]}>
                  @{member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Campo de texto libre para otros responsables */}
          <Text style={styles.subtitle}>O escribir otro responsable:</Text>
          <TextInput
            style={styles.input}
            value={assignedTo}
            onChangeText={setAssignedTo}
            onBlur={handleAssignedToSave}
            placeholder="¿Quién se encargará de esta actividad?"
          />
        </View>

        <View style={[styles.section, { borderColor: selectedTask?.color }]}>
          <Text style={styles.sectionTitle}>Tiempo estimado</Text>
          <View style={styles.quickTimeButtonsContainer}>
            {quickTimeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.quickTimeButton,
                  estimatedTime === option.value.toString() && styles.quickTimeButtonSelected
                ]}
                onPress={() => handleQuickTimeSelect(option.value)}
              >
                <Text style={styles.quickTimeButtonEmoji}>
                  {option.emoji}
                </Text>
                <Text style={[
                  styles.quickTimeButtonText,
                  estimatedTime === option.value.toString() && styles.quickTimeButtonTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            value={estimatedTime}
            onChangeText={setEstimatedTime}
            onBlur={handleEstimatedTimeSave}
            placeholder="Tiempo en minutos (ej: 30)"
            keyboardType="numeric"
          />
          {selectedTask?.estimatedCompletionTime && (
            <Text style={styles.timeDisplay}>
              Tiempo estimado: {formatTime(selectedTask.estimatedCompletionTime)}
            </Text>
          )}
        </View>

        {/* Indicador de planeación completa */}
        <View style={[styles.section, { borderColor: selectedTask?.color }]}>
          {isPlanningComplete ? (
            <TouchableOpacity 
              style={[styles.completionIndicator, { backgroundColor: getIntenseColor(selectedTask?.color || '#6366F1') }]}
              onPress={handlePlanningComplete}
            >
              <Text style={styles.completionText}>✨ Planeación completa</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsText}>
                {!selectedTask?.title && "💡 Agrega un nombre para la actividad "} {!selectedTask?.assignedTo && "👤 Selecciona quién se encargará "} {!selectedTask?.estimatedCompletionTime && "⏱️ Define cuánto tiempo tomará"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  section: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    marginBottom: 4,
  },
  emojiText: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 8,
  },
  titleText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    fontSize: 13,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 6,
    color: "#333",
  },
  familyButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 8,
    gap: 12,
  },
  familyButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  familyButtonSelected: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  familyButtonEmoji: {
    fontSize: 20,
    marginBottom: 3,
  },
  familyButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  familyButtonTextSelected: {
    color: "white",
    fontWeight: "700",
  },
  quickTimeButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 8,
    gap: 12,
  },
  quickTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickTimeButtonSelected: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  quickTimeButtonEmoji: {
    fontSize: 20,
    marginBottom: 3,
  },
  quickTimeButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  quickTimeButtonTextSelected: {
    color: "white",
    fontWeight: "700",
  },
  timeDisplay: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  requirementsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    alignItems: "center",
  },
  requirementsText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  completionIndicator: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  completionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});

export default PlanningScreen;
