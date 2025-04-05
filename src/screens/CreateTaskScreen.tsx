import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CreateTaskScreenProps {}

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nueva Tarea</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CreateTaskScreen;