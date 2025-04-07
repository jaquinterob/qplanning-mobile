import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import emojisData from "../data/emojis.json"; // Importar el archivo JSON

interface EmojiSelectorProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiSelector: React.FC<EmojiSelectorProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [emojiCategories, setEmojiCategories] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    // Cargar los emojis desde el archivo JSON
    setEmojiCategories(emojisData);
    setSelectedCategory("Tareas del hogar")// Establecer la categoría por defecto
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji); // Devuelve el emoji seleccionado
    onClose(); // Cierra el modal
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const emojisToDisplay = selectedCategory
    ? emojiCategories[selectedCategory]
    : Object.values(emojiCategories).flat();

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecciona un Emoji</Text>

          {/* Barra superior para filtrar categorías */}
          <View style={styles.categoryBar}>
            <FlatList
              horizontal
              data={Object.keys(emojiCategories)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedCategory === item && styles.categoryButtonSelected,
                  ]}
                  onPress={() => handleCategorySelect(item)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === item &&
                        styles.categoryButtonTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <ScrollView>
            <View style={styles.emojiContainer}>
              {emojisToDisplay.map((emoji: string) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emojiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  emojiButton: {
    padding: 8,
    margin: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  emoji: {
    fontSize: 34,
  },
  categoryBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  categoryButtonSelected: {
    backgroundColor: "#007BFF",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#000",
  },
  categoryButtonTextSelected: {
    color: "#fff",
  },
  closeButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "black",
    fontSize: 16,
  },
});

export default EmojiSelector;
