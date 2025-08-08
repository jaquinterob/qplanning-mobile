import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Dimensions,
} from "react-native";
import TaskCard from "../components/TaskCard";
import type { Task } from "../types/Task";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { mockTask } from "../mocks/task.mock";
import { useStore } from "../store/useStore";
import { DEFAULT_EMOJI } from "../constants/constants";
import { TaskCardColors } from "../enums/task-card-colors";
import { colors } from "../theme/colors";
import EmojiSelector from "../components/EmojiSelector";
import ColorSelector from "../components/ColorSelector";

export type RootStackParamList = {
  Home: undefined;
  Planning: undefined;
};

const HomeScreen: React.FC = () => {
  const { tasks, setTasks, setSelectedTask, selectedTask, showToast, toastMessage } = useStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(DEFAULT_EMOJI);
  const [selectedColor, setSelectedColor] = useState(TaskCardColors.Default);
  const [isEmojiModalVisible, setIsEmojiModalVisible] = useState(false);
  
  // Estados para celebración épica
  const [celebratingGroups, setCelebratingGroups] = useState<Set<string>>(new Set());
  const celebrationAnims = useRef<{[key: string]: Animated.Value}>({}).current;
  const { width: screenWidth } = Dimensions.get('window');
  
  // Animaciones para medallas permanentes en headers
  const medalHeaderAnims = useRef<{[key: string]: Animated.Value}>({}).current;

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
        emoji: selectedEmoji,
        color: selectedColor,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setSelectedEmoji(DEFAULT_EMOJI);
      setSelectedColor(TaskCardColors.Default);
      setModalVisible(false);
      Keyboard.dismiss(); // Ocultar teclado al guardar
    } else {
      Alert.alert("Error", "Por favor ingresa un título para la actividad");
    }
  };

  const handleCancelTask = () => {
    setNewTaskTitle("");
    setSelectedEmoji(DEFAULT_EMOJI);
    setSelectedColor(TaskCardColors.Default);
    setModalVisible(false);
    Keyboard.dismiss(); // Ocultar teclado al cancelar
  };

  const handleSavePlanning = (task: Task) => {
    setSelectedTask(task);
    navigation?.navigate("Planning");
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setIsEmojiModalVisible(false);
  };

  const handleColorSelect = (color: TaskCardColors) => {
    setSelectedColor(color);
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleTimerStart = (taskId: string) => {
    // Encontrar la tarea que se va a iniciar para obtener su responsable
    const taskToStart = tasks.find(task => task.id === taskId);
    if (!taskToStart || !taskToStart.assignedTo) return;
    
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        // Iniciar el timer de la tarea seleccionada
        return { 
          ...task, 
          timerStarted: true, 
          timerStartTime: Date.now(),
          timerPaused: false,
          elapsedTime: 0,
          isOverdue: false 
        };
      } else if (task.assignedTo === taskToStart.assignedTo && task.timerStarted && !task.timerPaused) {
        // Pausar otros timers activos del mismo responsable
        const currentTime = Date.now();
        const timeElapsed = task.timerStartTime ? currentTime - task.timerStartTime : 0;
        const totalElapsed = (task.elapsedTime || 0) + timeElapsed;
        
        return {
          ...task,
          timerPaused: true,
          elapsedTime: totalElapsed
        };
      }
      
      return task;
    });
    setTasks(updatedTasks);
  };

  const handleTimerPause = (taskId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId && task.timerStartTime) {
        const sessionElapsed = Date.now() - task.timerStartTime;
        const totalElapsed = (task.elapsedTime || 0) + sessionElapsed;
        return { 
          ...task, 
          timerPaused: true,
          elapsedTime: totalElapsed,
          timerStartTime: undefined
        };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const handleTimerResume = (taskId: string) => {
    // Encontrar la tarea que se va a reanudar para obtener su responsable
    const taskToResume = tasks.find(task => task.id === taskId);
    if (!taskToResume || !taskToResume.assignedTo) return;
    
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        // Reanudar el timer de la tarea seleccionada
        return { 
          ...task, 
          timerPaused: false,
          timerStartTime: Date.now()
        };
      } else if (task.assignedTo === taskToResume.assignedTo && task.timerStarted && !task.timerPaused) {
        // Pausar otros timers activos del mismo responsable
        const currentTime = Date.now();
        const timeElapsed = task.timerStartTime ? currentTime - task.timerStartTime : 0;
        const totalElapsed = (task.elapsedTime || 0) + timeElapsed;
        
        return {
          ...task,
          timerPaused: true,
          elapsedTime: totalElapsed
        };
      }
      
      return task;
    });
    setTasks(updatedTasks);
  };

  const handleTimerReset = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { 
            ...task, 
            timerStarted: false, 
            timerStartTime: undefined,
            timerPaused: false,
            elapsedTime: 0,
            isOverdue: false 
          }
        : task
    );
    setTasks(updatedTasks);
  };

  const handleTimerStop = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { 
            ...task, 
            timerStarted: false, 
            timerStartTime: undefined,
            timerPaused: false,
            elapsedTime: 0,
            isOverdue: false 
          }
        : task
    );
    setTasks(updatedTasks);
  };

  // 🎉 CELEBRACIÓN ÉPICA para grupos completados
  // 🏅 Función para inicializar animación de medalla permanente
  const initializeMedalAnimation = (responsible: string) => {
    if (!medalHeaderAnims[responsible]) {
      medalHeaderAnims[responsible] = new Animated.Value(1);
    }
    
    // Crear animación de titilación infinita
    const createPulseAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(medalHeaderAnims[responsible], {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(medalHeaderAnims[responsible], {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
    };
    
    createPulseAnimation().start();
  };

  const triggerGroupCelebration = (responsible: string) => {
    if (celebratingGroups.has(responsible)) return; // Ya está celebrando
    
    // Agregar a grupos celebrando
    setCelebratingGroups(prev => new Set([...prev, responsible]));
    
    // Crear animación de medalla
    if (!celebrationAnims[responsible]) {
      celebrationAnims[responsible] = new Animated.Value(0);
    }
    
    // Secuencia de celebración épica
    Animated.sequence([
      // 1. Entrada dramática de la medalla
      Animated.timing(celebrationAnims[responsible], {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // 2. Pausa para el efecto
      Animated.delay(2000),
      // 3. Salida suave
      Animated.timing(celebrationAnims[responsible], {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Limpiar después de la celebración
      setCelebratingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(responsible);
        return newSet;
      });
    });
  };

  const handleTaskComplete = (taskId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const isCompleting = !task.completed;
        
        if (isCompleting && task.timerStarted) {
          // Calcular tiempo real transcurrido al completar
          const currentTime = Date.now();
          let totalElapsed = task.elapsedTime || 0;
          
          if (!task.timerPaused && task.timerStartTime) {
            totalElapsed += currentTime - task.timerStartTime;
          }
          
          return {
            ...task,
            completed: true,
            timerStarted: false,
            timerStartTime: undefined,
            timerPaused: false,
            actualCompletionTime: totalElapsed
          };
        } else if (!isCompleting) {
          // Si se desmarca como completada, limpiar tiempo de completion
          return {
            ...task,
            completed: false,
            actualCompletionTime: undefined
          };
        }
        
        return {
          ...task,
          completed: isCompleting
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    
    // 🎯 Verificar si se completó un grupo entero para celebrar
    const completedTask = updatedTasks.find(t => t.id === taskId);
    if (completedTask?.completed && completedTask.assignedTo) {
      const groupTasks = updatedTasks.filter(t => t.assignedTo === completedTask.assignedTo);
      const allCompleted = groupTasks.every(t => t.completed);
      
      if (allCompleted && groupTasks.length > 0) {
        // 🎉 ¡GRUPO COMPLETADO! ¡CELEBRAR!
        setTimeout(() => triggerGroupCelebration(completedTask.assignedTo!), 300);
      }
    }
  };

  useEffect(() => {
    // Solo cargar las tareas mock si no hay tareas existentes
    if (tasks.length === 0) {
      getTasks();
    }
  }, []);

  // Forzar actualización cuando se regrese a la pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Forzar re-render cuando se regrese a la pantalla
      setTasks([...tasks]);
    });

    return unsubscribe;
  }, [navigation, tasks]);



  // Separar tareas planeadas y sin planear
  const unplannedTasks = tasks.filter((task) => !task.assignedTo);
  const plannedTasks = tasks.filter((task) => task.assignedTo);

  // Agrupar tareas planeadas por responsable
  const groupedTasks = plannedTasks.reduce((groups: { [key: string]: Task[] }, task) => {
    const responsible = task.assignedTo || "Sin asignar";
    if (!groups[responsible]) {
      groups[responsible] = [];
    }
    groups[responsible].push(task);
    return groups;
  }, {});

  // Función para obtener el emoji del responsable
  const getResponsibleEmoji = (responsibleName: string): string => {
    const emojiMap: { [key: string]: string } = {
      "Eva": "👧🏻",
      "Rafa": "👦🏻", 
      "Mamá": "👩🏻",
      "Papá": "👨🏻"
    };
    return emojiMap[responsibleName] || "👤";
  };

  // 🏅 Componente de medalla permanente para header
  const renderPermanentMedal = (responsible: string, isCompleted: boolean) => {
    if (!isCompleted) return null;
    
    // Inicializar animación si no existe
    if (!medalHeaderAnims[responsible]) {
      initializeMedalAnimation(responsible);
    }
    
    return (
      <Animated.View
        style={[
          styles.permanentMedal,
          {
            transform: [
              {
                scale: medalHeaderAnims[responsible] || 1,
              },
            ],
          },
        ]}
      >
        <Text style={styles.permanentMedalText}>🏆</Text>
      </Animated.View>
    );
  };

  // 🎊 Componente de confeti y medalla épica
  const renderGroupCelebration = (responsible: string) => {
    if (!celebratingGroups.has(responsible) || !celebrationAnims[responsible]) {
      return null;
    }

    const animValue = celebrationAnims[responsible];
    
    // Crear múltiples confetis con posiciones aleatorias
    const confettiPieces = Array.from({ length: 20 }, (_, i) => (
      <Animated.View
        key={i}
        style={[
          styles.confettiPiece,
          {
            left: Math.random() * screenWidth,
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 6)],
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 400],
                }),
              },
              {
                rotate: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '720deg'],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0.8],
                }),
              },
            ],
          },
        ]}
      />
    ));

    return (
      <View style={styles.celebrationContainer} pointerEvents="none">
        {/* Confeti animado */}
        {confettiPieces}
        
        {/* Medalla épica */}
        <Animated.View
          style={[
            styles.medalContainer,
            {
              opacity: animValue,
              transform: [
                {
                  scale: animValue.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [0, 1.2, 1],
                  }),
                },
                {
                  rotate: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.medal}>
            <Text style={styles.medalEmoji}>🏆</Text>
            <Text style={styles.medalText}>¡COMPLETADO!</Text>
            <Text style={styles.medalSubtext}>{responsible}</Text>
          </View>
          
          {/* Efectos de brillo */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                transform: [
                  {
                    scale: animValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.3, 1],
                    }),
                  },
                ],
                opacity: animValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.8, 0.3],
                }),
              },
            ]}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            {toastMessage}
          </Text>
        </View>
      )}
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tareas sin planear */}
        {unplannedTasks.length > 0 && (
          <>
            <Text style={styles.title}>Actividades sin planear</Text>
            {unplannedTasks.map((item) => (
              <View key={item.id} style={styles.taskCardContainer}>
                <TaskCard
                  task={item}
                  onLongPress={() => handleSavePlanning(item)}
                  onTaskComplete={handleTaskComplete}
                />
              </View>
            ))}
          </>
        )}
        
        {/* Tareas agrupadas por responsable */}
        {Object.keys(groupedTasks).length > 0 && (
          <>
            {unplannedTasks.length > 0 && (
              <Text style={styles.mainTitle}>Actividades planeadas</Text>
            )}
            {Object.entries(groupedTasks).map(([responsible, tasks]) => {
              const completedTasks = tasks.filter(task => task.completed).length;
              const totalTasks = tasks.length;
              const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              const isGroupCompleted = completedTasks === totalTasks && totalTasks > 0;
              
              return (
                <View key={responsible} style={styles.responsibleSection}>
                  <View style={styles.responsibleHeader}>
                    <View style={styles.headerTopRow}>
                      <View style={styles.responsibleTitleContainer}>
                        <Text style={styles.responsibleTitle}>
                          {getResponsibleEmoji(responsible)} {responsible}
                        </Text>
                        {/* 🏆 Medalla permanente titilante */}
                        {renderPermanentMedal(responsible, isGroupCompleted)}
                      </View>
                      <View style={styles.taskCount}>
                        <Text style={styles.taskCountText}>{tasks.length}</Text>
                      </View>
                    </View>
                    
                    {/* Barra de progreso dentro de la cabecera */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${completionPercentage}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round(completionPercentage)}% ({completedTasks}/{totalTasks})
                      </Text>
                    </View>
                  </View>
                <View style={styles.groupedListContainer}>
                  {tasks.map((item) => (
                    <View key={item.id} style={styles.groupedTaskCardContainer}>
                      <TaskCard
                        task={item}
                        onLongPress={() => handleSavePlanning(item)}
                        isGrouped={true}
                        onTimerStart={handleTimerStart}
                        onTimerPause={handleTimerPause}
                        onTimerResume={handleTimerResume}
                        onTimerReset={handleTimerReset}
                        onTimerStop={handleTimerStop}
                        onTaskComplete={handleTaskComplete}
                      />
                    </View>
                  ))}
                </View>
                
                {/* 🎉 Celebración épica para este grupo */}
                {renderGroupCelebration(responsible)}
              </View>
              );
            })}
          </>
        )}
        
        {/* Espaciado extra para el floating button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddTaskPress}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      {/* Modal mejorado */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelTask}
      >
        <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: selectedColor }]}>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Nueva Actividad</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleCancelTask}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    style={styles.modalBody} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                  >
                    {/* Emoji Section */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Emoji</Text>
                      <TouchableOpacity
                        style={styles.emojiSelector}
                        onPress={() => setIsEmojiModalVisible(true)}
                      >
                        <Text style={styles.emojiDisplay}>{selectedEmoji}</Text>
                        <Text style={styles.emojiHint}>Toca para cambiar</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Color Section */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Color de la tarjeta</Text>
                      <ColorSelector onSelect={handleColorSelect} />
                    </View>

                    {/* Title Section */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Título de la actividad</Text>
                      <TextInput
                        style={styles.titleInput}
                        placeholder="¿Qué actividad quieres agregar?"
                        placeholderTextColor={colors.text.light}
                        value={newTaskTitle}
                        onChangeText={setNewTaskTitle}
                        multiline
                        maxLength={100}
                        returnKeyType="done"
                        blurOnSubmit={true}
                        onSubmitEditing={handleDismissKeyboard}
                        textAlignVertical="top"
                      />
                      <Text style={styles.characterCount}>
                        {newTaskTitle.length}/100
                      </Text>
                    </View>
                  </ScrollView>

                  {/* Footer */}
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelTask}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        !newTaskTitle.trim() && styles.saveButtonDisabled,
                      ]}
                      onPress={handleSaveTask}
                      disabled={!newTaskTitle.trim()}
                    >
                      <Text style={styles.saveButtonText}>Crear Actividad</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>

        {/* Emoji Selector Modal */}
        <EmojiSelector
          visible={isEmojiModalVisible}
          onSelect={handleEmojiSelect}
          onClose={() => setIsEmojiModalVisible(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Espacio para el floating button
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    color: colors.text.primary,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 16,
    paddingBottom: 8,
    color: colors.text.primary,
  },
  taskCardContainer: {
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 10,
  },
  bottomSpacer: {
    height: 20,
  },
  responsibleSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  responsibleHeader: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(99, 102, 241, 0.15)",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  responsibleTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.3,
  },
  taskCount: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  taskCountText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6366F1",
  },
  groupedListContainer: {
    paddingHorizontal: 0,
    paddingBottom: 16,
    paddingTop: 4,
  },
  groupedTaskCardContainer: {
    paddingHorizontal: 0,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366F1",
    minWidth: 65,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6366F1",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalContent: {
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  emojiSelector: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderStyle: "dashed",
  },
  emojiDisplay: {
    fontSize: 48,
    marginBottom: 8,
  },
  emojiHint: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  titleInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.white,
    minHeight: 60,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: colors.text.light,
    textAlign: "right",
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#6366F1",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.light,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  toast: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(99, 102, 241, 0.85)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  toastText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // 🎊 ESTILOS ÉPICOS DE CELEBRACIÓN
  celebrationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  medalContainer: {
    position: 'absolute',
    top: 50,
    left: '50%',
    marginLeft: -80,
    alignItems: 'center',
    zIndex: 1001,
  },
  medal: {
    backgroundColor: '#FFD700',
    borderRadius: 80,
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 6,
    borderColor: '#FFA500',
  },
  medalEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  medalText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8B4513',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  medalSubtext: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0522D',
    textAlign: 'center',
    marginTop: 4,
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 100,
    zIndex: -1,
  },
  
  // 🏅 ESTILOS PARA MEDALLA PERMANENTE
  responsibleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permanentMedal: {
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  permanentMedalText: {
    fontSize: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default HomeScreen;
