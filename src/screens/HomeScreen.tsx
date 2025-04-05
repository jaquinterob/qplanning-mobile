import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import TaskCard from '../components/TaskCard';
import { Task } from '../types/Task';

const HomeScreen: React.FC = () => {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Reunión de equipo',
      emoji: '👥',
      status: 'pending',
      assignedTo: 'Juan',
    },
    {
      id: '2',
      title: 'Revisar documentación',
      emoji: '📄',
      status: 'completed',
      assignedTo: 'María',
    },
    {
      id: '3',
      title: 'Desarrollar nueva funcionalidad',
      emoji: '💻',
      status: 'in-progress',
      assignedTo: 'Carlos',
    },
    {
      id: '4',
      title: 'Brainstorming de ideas',
      emoji: '💡',
      status: 'pending',
      assignedTo: 'Ana',
    },
    {
      id: '5',
      title: 'Revisar feedback de usuarios',
      emoji: '📝',
      status: 'pending',
      assignedTo: 'Pedro',
    },
  ]);

  const handleTaskPress = (taskId: string) => {
    console.log('Task pressed:', taskId);
  };

  return (
    <View style={styles.container}>
      <Text></Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
});

export default HomeScreen;