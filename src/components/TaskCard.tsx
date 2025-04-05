import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task, TaskStatus } from '../types/Task';
import { colors } from '../theme/colors';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'in-progress':
      return '#FFD700'; // Amarillo fuerte
    case 'completed':
      return colors.blue.primary;
    default:
      return '#9E9E9E'; // Gris para pendiente
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const statusColor = getStatusColor(task.status);
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.card,
        { borderLeftColor: statusColor }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <View style={styles.taskInfo}>
            <Text style={styles.title}>{task.title}</Text>
            
            <View style={styles.statusContainer}>
              <View style={[styles.status, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>
                  {task.status === 'in-progress' ? 'En progreso' : 
                   task.status === 'completed' ? 'Completado' : 'Pendiente'}
                </Text>
              </View>
              
              <Text style={styles.assignedTo}>👤 {task.assignedTo}</Text>
            </View>
          </View>
          
          <View style={[styles.emojiContainer, { borderColor: statusColor }]}>
            <Text style={styles.emoji}>{task.emoji}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    padding: 4,
    borderRadius: 4,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  assignedTo: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  emoji: {
    fontSize: 32,
  },
});

export default TaskCard; 