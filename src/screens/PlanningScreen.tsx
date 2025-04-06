import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Asegúrate de instalar esta dependencia

const PlanningScreen: React.FC = () => {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [assignedTo, setAssignedTo] = useState("Eva"); // Valor predeterminado
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState("");

  const handleSubmit = () => {
    const newTask = {
      id: Date.now().toString(),
      title,
      emoji,
      status: "pending", // Estado predeterminado
      assignedTo,
      estimatedCompletionTime: parseInt(estimatedCompletionTime, 10),
    };
    console.log("New Task:", newTask);
    // Aquí puedes manejar el envío de la tarea, como guardarla en un estado o enviarla a un backend.
  };

  return (
    <View >
   
    </View>
  );
};

const styles = StyleSheet.create({
 
});

export default PlanningScreen;
