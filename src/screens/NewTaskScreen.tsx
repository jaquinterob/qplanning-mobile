import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { DEFAULT_EMOJI } from "../constants/constants";
import { TaskCardColors } from "../enums/task-card-colors";
import { colors } from "../theme/colors";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import EmojiSelector from "../components/EmojiSelector";
import ColorSelector from "../components/ColorSelector";

const NewTaskScreen: React.FC = () => {
  const { tasks, setTasks } = useStore();
  const navigation = useNavigation();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(DEFAULT_EMOJI);
  const [selectedColor, setSelectedColor] = useState(TaskCardColors.Default);
  const [isEmojiModalVisible, setIsEmojiModalVisible] = useState(false);

  const handleSaveTask = () => {
    if (newTaskTitle.trim()) {
      const newTask = {
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
      navigation.goBack();
      Keyboard.dismiss();
    } else {
      Alert.alert("Error", "Por favor ingresa un título para la actividad");
    }
  };

  const handleCancelTask = () => {
    setNewTaskTitle("");
    setSelectedEmoji(DEFAULT_EMOJI);
    setSelectedColor(TaskCardColors.Default);
    navigation.goBack();
    Keyboard.dismiss();
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancelTask}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Actividad</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
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
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
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
      </KeyboardAvoidingView>

      {/* Emoji Selector Modal */}
      <EmojiSelector
        visible={isEmojiModalVisible}
        onSelect={handleEmojiSelect}
        onClose={() => setIsEmojiModalVisible(false)}
      />
    </SafeAreaView>
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
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
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
  footer: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    backgroundColor: 'white',
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
});

export default NewTaskScreen;
