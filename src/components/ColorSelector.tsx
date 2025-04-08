import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TaskCardColors } from "../enums/task-card-colors";

interface ColorSelectorProps {
  onSelect: (color: TaskCardColors) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ onSelect }) => {
  const colorNames = Object.keys(TaskCardColors);
  return (
    <View style={styles.container}>
      {colorNames.map((colorName) => {
        const colorValue = (TaskCardColors as any)[colorName];
        return (
          <TouchableOpacity
            key={colorName}
            style={[styles.colorBox, { backgroundColor: colorValue }]}
            onPress={() => onSelect(colorValue)}
          >
            <Text></Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  colorBox: {
    width: 30,
    height: 30,
    borderRadius: 25,
    margin: 5,
    borderWidth: 2,
    borderColor: "black",
  },
});

export default ColorSelector;
