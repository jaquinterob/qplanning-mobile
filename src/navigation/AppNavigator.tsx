import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PlanningScreen from "../screens/PlanningScreen";
import FamilySetupScreen from "../screens/FamilySetupScreen";
import NewTaskScreen from "../screens/NewTaskScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ 
            title: "qplanning", 
            headerShown: false // Ocultar header para usar el personalizado
          }}
        />
        <Stack.Screen
          name="FamilySetup"
          component={FamilySetupScreen}
          options={{ 
            title: "Configuración de Familia",
            headerShown: false // Pantalla completa sin header
          }}
        />
        <Stack.Screen
          name="Planning"
          component={PlanningScreen}
          options={{ title: "Planeando la actividad" }}
        />
        <Stack.Screen
          name="NewTask"
          component={NewTaskScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
