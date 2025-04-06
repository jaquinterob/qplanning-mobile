import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useStore } from "../store/useStore";

const PlanningScreen: React.FC = () => {
  const { selectedTask } = useStore();
  return (
    <View>
      <Text>{JSON.stringify(selectedTask)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({});

export default PlanningScreen;
