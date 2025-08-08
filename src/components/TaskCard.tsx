import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import type { Task } from "../types/Task";
import { colors } from "../theme/colors";

interface TaskCardProps {
  task: Task;
  onLongPress?: () => void;
  isGrouped?: boolean;
  onTimerStart?: (taskId: string) => void;
  onTimerPause?: (taskId: string) => void;
  onTimerResume?: (taskId: string) => void;
  onTimerReset?: (taskId: string) => void;
  onTimerStop?: (taskId: string) => void;
  onTaskComplete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onLongPress,
  isGrouped = false,
  onTimerStart,
  onTimerPause,
  onTimerResume,
  onTimerReset,
  onTimerStop,
  onTaskComplete,
}) => {
  const hasOptionalProperties =
    task.emoji ||
    (task.assignedTo && !isGrouped) ||
    task.estimatedCompletionTime;

  // Función para obtener el emoji del responsable
  const getResponsibleEmoji = (responsibleName: string): string => {
    const emojiMap: { [key: string]: string } = {
      Eva: "👧🏻",
      Rafa: "👦🏻",
      Mamá: "👩🏻",
      Papá: "👨🏻",
    };
    return emojiMap[responsibleName] || "👤";
  };

  // Estado del temporizador
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // Animación para el borde pulsante
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Efecto para animar el borde cuando la tarea está activa
  useEffect(() => {
    if (task.timerStarted && !task.timerPaused) {
      // Iniciar animación de pulso
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();
      
      return () => {
        pulseAnimation.stop();
        pulseAnim.setValue(1);
      };
    } else {
      // Detener animación y resetear valor
      pulseAnim.setValue(1);
    }
  }, [task.timerStarted, task.timerPaused, pulseAnim]);

  // Calcular tiempo restante
  useEffect(() => {
    if (
      task.timerStarted &&
      !task.timerPaused &&
      task.timerStartTime &&
      task.estimatedCompletionTime
    ) {
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const sessionElapsed = currentTime - task.timerStartTime!;
        const totalElapsed = (task.elapsedTime || 0) + sessionElapsed;
        const estimatedMs = task.estimatedCompletionTime! * 60 * 1000;
        const remaining = estimatedMs - totalElapsed;

        setTimeRemaining(remaining);
        setIsTimerActive(remaining > 0);
      }, 1000);

      return () => clearInterval(interval);
    } else if (
      task.timerStarted &&
      task.timerPaused &&
      task.estimatedCompletionTime
    ) {
      // Cuando está pausado, calcular tiempo restante basado en tiempo transcurrido
      const estimatedMs = task.estimatedCompletionTime * 60 * 1000;
      const remaining = estimatedMs - (task.elapsedTime || 0);
      setTimeRemaining(remaining);
      setIsTimerActive(remaining > 0);
    } else {
      setIsTimerActive(false);
      setTimeRemaining(0);
    }
  }, [
    task.timerStarted,
    task.timerPaused,
    task.timerStartTime,
    task.elapsedTime,
    task.estimatedCompletionTime,
  ]);

  // Formatear tiempo para mostrar (incluyendo tiempo negativo)
  const formatTime = (ms: number): string => {
    const isNegative = ms < 0;
    const absoluteMs = Math.abs(ms);

    if (absoluteMs === 0) return "00:00";

    const totalSeconds = Math.ceil(absoluteMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    return isNegative ? `-${timeString}` : timeString;
  };

  // Manejar inicio/pausa/reanudación del temporizador
  const handleTimerToggle = () => {
    if (!task.timerStarted) {
      // Iniciar temporizador
      onTimerStart?.(task.id);
    } else if (task.timerPaused) {
      // Reanudar temporizador
      onTimerResume?.(task.id);
    } else {
      // Pausar temporizador
      onTimerPause?.(task.id);
    }
  };

  // Función para renderizar el indicador de tiempo de completion
  const renderCompletionTimeIndicator = () => {
    if (!task.actualCompletionTime || !task.estimatedCompletionTime) return null;

    const actualMinutes = Math.ceil(task.actualCompletionTime / (1000 * 60));
    const estimatedMinutes = task.estimatedCompletionTime;
    const isOvertime = actualMinutes > estimatedMinutes;
    const difference = actualMinutes - estimatedMinutes;

    return (
      <View style={[
        styles.timeIndicatorBadge,
        isOvertime ? styles.overtimeBadge : styles.onTimeBadge
      ]}>
        <MaterialIcons
          name={isOvertime ? "schedule" : "check-circle"}
          size={12}
          color="#FFFFFF"
        />
        <Text style={styles.timeIndicatorText}>
          {isOvertime ? `+${difference}m` : `${actualMinutes}m`}
        </Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.card,
        isGrouped && styles.groupedCard,
        task.completed && { opacity: 0.5 },
        timeRemaining < 0 && task.timerStarted && styles.overdueCard,
        { backgroundColor: task.color },
        // Indicador para tarea activa (timer corriendo) - SIN borde fijo
        task.timerStarted && !task.timerPaused && styles.activeTaskCard,
        // Indicador para tarea pausada (timer iniciado pero pausado)
        task.timerStarted && task.timerPaused && styles.pausedTaskCard,
      ]}
    >
      {/* Borde animado superpuesto para tarea activa */}
      {task.timerStarted && !task.timerPaused && (
        <Animated.View
          style={[
            styles.animatedBorderOverlay,
            { 
              opacity: pulseAnim,
              borderLeftWidth: 4,
              borderLeftColor: "#6366F1",
            }
          ]}
        />
      )}
      
      <TouchableOpacity
        style={styles.touchableContent}
        onLongPress={onLongPress}
      >
      <View style={styles.content}>
        {hasOptionalProperties ? (
          <View style={styles.mainContent}>
            {/* Botón de completar */}
            <TouchableOpacity
              style={[
                styles.completeButton,
                task.completed && styles.completeButtonActive,
              ]}
              onPress={() => onTaskComplete?.(task.id)}
            >
              <MaterialIcons
                                 name={task.completed ? "check" : "radio-button-unchecked"}
                size={24}
                                 color={task.completed ? "#6366F1" : "#9CA3AF"}
              />
            </TouchableOpacity>
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

              {task.assignedTo && !isGrouped && (
                <Text style={styles.assignedTo}>
                  {getResponsibleEmoji(task.assignedTo)} {task.assignedTo}
                </Text>
              )}
              {/* Tiempo estimado con cuenta regresiva */}
              <View style={styles.timeInfoContainer}>
                <View style={styles.timeTextContainer}>
                  {task.estimatedCompletionTime && (
                    <Text style={styles.estimatedCompletionTime}>
                      🕒 {task.estimatedCompletionTime} min
                      {isGrouped && task.timerStarted && (
                        <Text
                          style={[
                            styles.countdownText,
                            timeRemaining < 0 && styles.overdueText,
                          ]}
                        >
                          {` • ⏲ ${formatTime(timeRemaining)}`}
                        </Text>
                      )}
                    </Text>
                  )}
                </View>

                {/* Área de botones derecha: completado + timer */}
                <View style={styles.rightButtonsContainer}>
                  {/* Botones de temporizador - solo para tarjetas agrupadas con tiempo estimado */}
                  {isGrouped && task.estimatedCompletionTime && (
                    <View style={styles.timerButtonsContainer}>
                      {/* Botón de reset - solo visible cuando ya se ha iniciado el primer conteo */}
                      {(task.timerStarted ||
                        (task.elapsedTime && task.elapsedTime > 0)) && (
                        <TouchableOpacity
                          style={[
                            styles.resetButton,
                            task.completed && styles.disabledButton
                          ]}
                          onPress={() => !task.completed && onTimerReset?.(task.id)}
                          disabled={task.completed}
                        >
                          <MaterialIcons
                            name="refresh"
                            size={16}
                            color={task.completed ? "#C4C4C4" : "#6B7280"}
                          />
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.timerButton,
                          task.timerStarted &&
                            !task.timerPaused &&
                            !task.completed &&
                            styles.timerButtonActive,
                          task.timerStarted &&
                            task.timerPaused &&
                            !task.completed &&
                            styles.timerButtonPaused,
                          timeRemaining < 0 &&
                            task.timerStarted &&
                            !task.timerPaused &&
                            !task.completed &&
                            styles.timerButtonOverdue,
                          task.completed && styles.disabledButton
                        ]}
                        onPress={() => !task.completed && handleTimerToggle()}
                        disabled={task.completed}
                      >
                        <MaterialIcons
                          name={
                            !task.timerStarted
                              ? "play-arrow"
                              : task.timerPaused
                              ? "play-circle-filled"
                              : "pause"
                          }
                          size={18}
                          color={
                            task.completed
                              ? "#C4C4C4"
                              : task.timerStarted && !task.timerPaused
                              ? "white"
                              : task.timerStarted && task.timerPaused
                              ? "#8B5CF6"
                              : "#6366F1"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Indicador de tiempo completado - solo para tareas completadas con tiempo real */}
                  {task.completed && task.actualCompletionTime && task.estimatedCompletionTime && (
                    <View style={styles.completionTimeIndicator}>
                      {renderCompletionTimeIndicator()}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.simpleTaskContainer}>
            <View style={styles.simpleTaskContent}>
              <Text style={styles.title}>{task.title}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.completeButton,
                task.completed && styles.completeButtonActive,
              ]}
              onPress={() => onTaskComplete?.(task.id)}
            >
              <MaterialIcons
                                 name={task.completed ? "check" : "radio-button-unchecked"}
                size={24}
                                 color={task.completed ? "#6366F1" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 3,
    marginHorizontal: 2,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  groupedCard: {
    marginHorizontal: 0,
    borderRadius: 8,
  },
  overdueCard: {
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  content: {
    flex: 1,
    position: "relative",
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
    color: "#333",
    marginBottom: 0,
    textAlign: "left",
  },
  assignedTo: {
    fontSize: 14,
    color: "#555",
    marginTop: 1,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginRight: 0,
    marginLeft: 10,
  },
  emoji: {
    fontSize: 32,
    textAlign: "center",
  },
  estimatedCompletionTime: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
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
  timeInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -5,
  },
  rightButtonsContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  completionTimeIndicator: {
    position: "absolute",
    top: -30,
    right: -8,
    zIndex: 10,
  },
  timeIndicatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  onTimeBadge: {
    backgroundColor: "#6366F1",
  },
  overtimeBadge: {
    backgroundColor: "#EF4444",
  },
  timeIndicatorText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.4,
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  timerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeTextContainer: {
    flex: 1,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
  overdueText: {
    color: "#EF4444",
    fontWeight: "700",
  },
  timerButton: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.3)",
    marginLeft: 8,
  },
  timerButtonActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  timerButtonPaused: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    borderColor: "#8B5CF6",
    borderWidth: 2,
  },
  timerButtonOverdue: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  resetButton: {
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(107, 114, 128, 0.2)",
  },

  completeButton: {
    marginLeft: -7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  completeButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOpacity: 0.1,
  },

  simpleTaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  simpleTaskContent: {
    flex: 1,
    paddingRight: 12,
  },
  touchableContent: {
    flex: 1,
  },
  animatedBorderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    pointerEvents: "none",
  },
  activeTaskCard: {
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pausedTaskCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#9CA3AF",
    shadowColor: "#9CA3AF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default TaskCard;
