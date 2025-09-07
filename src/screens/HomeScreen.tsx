import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import TaskCard from "../components/TaskCard";
import type { Task } from "../types/Task";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { useFamilyStore } from "../store/useFamilyStore";
import { colors } from "../theme/colors";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/Sidebar";

export type RootStackParamList = {
  FamilySetup: undefined;
  Home: undefined;
  Planning: undefined;
  NewTask: undefined;
};

const HomeScreen: React.FC = () => {
  const { tasks, setTasks, setSelectedTask, selectedTask, showToast, toastMessage, loadTasks, isLoading } = useStore();
  const { familyMembers, isFamilyConfigured, loadFamilyMembers } = useFamilyStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [hasCheckedFamilyConfig, setHasCheckedFamilyConfig] = useState(false);
  
  // Estados para celebración épica
  const [celebratingGroups, setCelebratingGroups] = useState<Set<string>>(new Set());
  const celebrationAnims = useRef<{[key: string]: Animated.Value}>({}).current;
  const { width: screenWidth } = Dimensions.get('window');
  
  // Animaciones para medallas permanentes en headers
  const medalHeaderAnims = useRef<{[key: string]: Animated.Value}>({}).current;
  
  // Estado para modal de celebración completa
  const [showCompleteCelebration, setShowCompleteCelebration] = useState(false);
  const completeCelebrationAnim = useRef(new Animated.Value(0)).current;

  // Cargar datos al iniciar la app
  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([
        loadTasks(),
        loadFamilyMembers()
      ]);
      setHasCheckedFamilyConfig(true);
    };
    
    initializeApp();
  }, [loadTasks, loadFamilyMembers]);

  // Verificar configuración de familia SOLO UNA VEZ después de cargar
  useEffect(() => {
    if (hasCheckedFamilyConfig && familyMembers.length === 0) {
      navigation.navigate('FamilySetup');
    }
  }, [hasCheckedFamilyConfig, familyMembers.length, navigation]);



  const handleAddTaskPress = () => {
    navigation.navigate('NewTask');
  };


  const handleSavePlanning = (task: Task) => {
    setSelectedTask(task);
    navigation?.navigate("Planning");
  };


  const handleTimerStart = useCallback((taskId: string) => {
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
  }, [tasks, setTasks]);

  const handleTimerPause = useCallback((taskId: string) => {
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
  }, [tasks, setTasks]);

  const handleTimerResume = useCallback((taskId: string) => {
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
  }, [tasks, setTasks]);

  const handleTimerReset = useCallback((taskId: string) => {
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
  }, [tasks, setTasks]);

  const handleTimerStop = useCallback((taskId: string) => {
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
  }, [tasks, setTasks]);

  // CELEBRACIÓN ÉPICA para grupos completados
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



  // Eliminar todas las tareas de una agrupación
  const handleDeleteAllTasks = (responsible: string) => {
    Alert.alert(
      "Eliminar Todas las Tareas",
      `¿Estás seguro de que quieres eliminar todas las tareas de ${responsible}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar Todo",
          style: "destructive",
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.assignedTo !== responsible);
            setTasks(updatedTasks);
          },
        },
      ]
    );
  };

  // Verificar si todas las agrupaciones están completas
  const checkAllGroupsComplete = (currentTasks: Task[]) => {
    const plannedTasks = currentTasks.filter(task => task.assignedTo);
    const groupedTasks = plannedTasks.reduce((groups: { [key: string]: Task[] }, task) => {
      const responsible = task.assignedTo || "Sin asignar";
      if (!groups[responsible]) {
        groups[responsible] = [];
      }
      groups[responsible].push(task);
      return groups;
    }, {});

    // Verificar si hay agrupaciones y si todas están completas
    const groupKeys = Object.keys(groupedTasks);
    if (groupKeys.length > 0) {
      const allGroupsComplete = groupKeys.every(responsible => {
        const groupTasks = groupedTasks[responsible];
        return groupTasks.every(task => task.completed);
      });

      if (allGroupsComplete) {
        // ¡TODAS LAS AGRUPACIONES COMPLETADAS!
        setTimeout(() => {
          setShowCompleteCelebration(true);
          triggerCompleteCelebration();
        }, 500);
      }
    }
  };

  // Función para activar la celebración completa
  const triggerCompleteCelebration = () => {
    // Animación de entrada épica
    Animated.sequence([
      Animated.timing(completeCelebrationAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(completeCelebrationAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(completeCelebrationAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTaskComplete = useCallback((taskId: string) => {
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
        // ¡GRUPO COMPLETADO! ¡CELEBRAR!
        setTimeout(() => triggerGroupCelebration(completedTask.assignedTo!), 300);
      }
    }
    
    // Verificar si TODAS las agrupaciones están completas
    checkAllGroupsComplete(updatedTasks);
  }, [tasks, setTasks, checkAllGroupsComplete]);



  // Forzar actualización cuando se regrese a la pantalla - OPTIMIZADO
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Solo recargar tareas si es necesario, no forzar re-render
      loadTasks();
    });

    return unsubscribe;
  }, [navigation, loadTasks]);



  // Separar tareas planeadas y sin planear - MEMOIZADO
  const { unplannedTasks, plannedTasks, groupedTasks } = useMemo(() => {
    const unplanned = tasks.filter((task) => !task.assignedTo);
    const planned = tasks.filter((task) => task.assignedTo);
    
    // Agrupar tareas planeadas por responsable
    const grouped = planned.reduce((groups: { [key: string]: Task[] }, task) => {
      const responsible = task.assignedTo || "Sin asignar";
      if (!groups[responsible]) {
        groups[responsible] = [];
      }
      groups[responsible].push(task);
      return groups;
    }, {});

    return { unplannedTasks: unplanned, plannedTasks: planned, groupedTasks: grouped };
  }, [tasks]);

  // Función para obtener el emoji del responsable desde la configuración
  const getResponsibleEmoji = (responsibleName: string): string => {
    const member = familyMembers.find(m => m.name === responsibleName && m.isActive);
    return member?.emoji || "👤";
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

  // Componente de confeti y medalla épica
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

  // Mostrar indicador de carga mientras se cargan las tareas
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando tareas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón de configuración */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QPlanning</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setIsSidebarVisible(true)}
        >
          <MaterialIcons name="settings" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

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
                      <View style={styles.headerActions}>
                        <View style={styles.taskCount}>
                          <Text style={styles.taskCountText}>{tasks.length}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteAllButton}
                          onPress={() => handleDeleteAllTasks(responsible)}
                        >
                          <Text style={styles.deleteAllButtonText}>🗑️</Text>
                        </TouchableOpacity>
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

      {/* 🏆 Modal de Celebración Completa ÉPICA */}
      <Modal
        visible={showCompleteCelebration}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCompleteCelebration(false)}
      >
        <View style={styles.completeCelebrationOverlay}>
          <Animated.View 
            style={[
              styles.completeCelebrationContainer,
              {
                transform: [
                  {
                    scale: completeCelebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
                opacity: completeCelebrationAnim,
              },
            ]}
          >
            {/* 🎊 Confeti animado */}
            {Array.from({ length: 50 }, (_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.completeConfettiPiece,
                  {
                    left: Math.random() * screenWidth,
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'][Math.floor(Math.random() * 8)],
                    transform: [
                      {
                        translateY: completeCelebrationAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 800],
                        }),
                      },
                      {
                        rotate: completeCelebrationAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '720deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}

            {/* 🏆 Medalla Gigante */}
            <View style={styles.completeMedalContainer}>
              <View style={styles.completeMedal}>
                <Text style={styles.completeMedalEmoji}>🏆</Text>
                <Text style={styles.completeMedalTitle}>¡MISIÓN CUMPLIDA!</Text>
                <Text style={styles.completeMedalSubtitle}>Todos los planes han sido completados</Text>
              </View>
            </View>

            {/* 💫 Efectos de brillo */}
            <View style={styles.completeGlowEffect} />
            <View style={[styles.completeGlowEffect, { top: 100, left: 50 }]} />
            <View style={[styles.completeGlowEffect, { top: 200, right: 50 }]} />

            {/* 🎉 Mensaje motivacional */}
            <View style={styles.completeMessageContainer}>
              <Text style={styles.completeMessageText}>
                Has demostrado que con dedicación y planificación, cualquier meta es alcanzable.
              </Text>
            </View>

            {/* ✅ Botón de cerrar */}
            <TouchableOpacity
              style={styles.completeCloseButton}
              onPress={() => setShowCompleteCelebration(false)}
            >
              <Text style={styles.completeCloseButtonText}>Entendido</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>


      {/* Sidebar */}
      <Sidebar
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
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
  
      // ESTILOS ÉPICOS DE CELEBRACIÓN
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
  
      // ESTILOS PARA ELIMINACIÓN DE TAREAS
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteAllButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteAllButtonText: {
    fontSize: 16,
  },
  
  // 🔄 ESTILOS PARA INDICADOR DE CARGA
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '600',
  },
  
      // ESTILOS ÉPICOS PARA CELEBRACIÓN COMPLETA
  completeCelebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeCelebrationContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  completeConfettiPiece: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  completeMedalContainer: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: 30,
  },
  completeMedal: {
    backgroundColor: '#FFD700',
    borderRadius: 100,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 8,
    borderColor: '#FFA500',
  },
  completeMedalEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  completeMedalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8B4513',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  completeMedalSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A0522D',
    textAlign: 'center',
    marginTop: 8,
  },
  completeGlowEffect: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
    borderRadius: 50,
    zIndex: 5,
  },
  completeMessageContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
    zIndex: 10,
  },
  completeMessageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#6366F1',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(99, 102, 241, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  completeMessageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  completeCloseButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  completeCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default HomeScreen;
