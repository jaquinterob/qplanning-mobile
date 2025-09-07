import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFamilyStore, FamilyMember } from '../store/useFamilyStore';
import { colors } from '../theme/colors';

interface FamilySetupModalProps {
  isVisible: boolean;
  onComplete: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const FamilySetupModal: React.FC<FamilySetupModalProps> = ({ isVisible, onComplete }) => {
  const { addFamilyMember, checkFamilyConfiguration } = useFamilyStore();
  const [members, setMembers] = useState<Omit<FamilyMember, 'id'>[]>([
    { name: '', emoji: '👤', isActive: true },
    { name: '', emoji: '👤', isActive: true },
  ]);

  const availableEmojis = ['👤', '👨', '👩', '👦', '👧', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👴', '👵'];

  const updateMember = (index: number, updates: Partial<Omit<FamilyMember, 'id'>>) => {
    setMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, ...updates } : member
    ));
  };

  const addMember = () => {
    setMembers(prev => [...prev, { name: '', emoji: '👤', isActive: true }]);
  };

  const removeMember = (index: number) => {
    if (members.length > 2) {
      setMembers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleComplete = async () => {
    const validMembers = members.filter(member => member.name.trim());
    
    if (validMembers.length < 2) {
      Alert.alert('Error', 'Debes configurar al menos 2 miembros de familia');
      return;
    }

    // Agregar todos los miembros
    for (const member of validMembers) {
      await addFamilyMember(member);
    }

    if (checkFamilyConfiguration()) {
      onComplete();
    } else {
      Alert.alert('Error', 'La configuración no es válida. Intenta de nuevo.');
    }
  };

  const canComplete = members.filter(member => member.name.trim()).length >= 2;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {}} // No permitir cerrar hasta completar
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="family-restroom" size={32} color="#6366F1" />
            </View>
            <Text style={styles.title}>¡Bienvenido a QPlanning!</Text>
            <Text style={styles.subtitle}>
              Configura los miembros de tu familia para poder asignar tareas
            </Text>
          </View>

          {/* Members Configuration */}
          <ScrollView style={styles.membersContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Miembros de la Familia</Text>
            
            {members.map((member, index) => (
              <View key={index} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberNumber}>Miembro {index + 1}</Text>
                  {members.length > 2 && (
                    <TouchableOpacity
                      onPress={() => removeMember(index)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="close" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.memberContent}>
                  {/* Emoji Selection */}
                  <View style={styles.emojiSection}>
                    <Text style={styles.fieldLabel}>Emoji</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.emojiContainer}>
                        {availableEmojis.map((emoji) => (
                          <TouchableOpacity
                            key={emoji}
                            style={[
                              styles.emojiOption,
                              member.emoji === emoji && styles.selectedEmoji
                            ]}
                            onPress={() => updateMember(index, { emoji })}
                          >
                            <Text style={styles.emojiText}>{emoji}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Name Input */}
                  <View style={styles.nameSection}>
                    <Text style={styles.fieldLabel}>Nombre</Text>
                    <TextInput
                      style={[
                        styles.nameInput,
                        member.name.trim() && styles.validInput
                      ]}
                      value={member.name}
                      onChangeText={(text) => updateMember(index, { name: text })}
                      placeholder="Nombre del miembro"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>
            ))}

            {/* Add Member Button */}
            <TouchableOpacity style={styles.addMemberButton} onPress={addMember}>
              <MaterialIcons name="add" size={24} color="#6366F1" />
              <Text style={styles.addMemberText}>Agregar otro miembro</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.requirementContainer}>
              <MaterialIcons
                name={canComplete ? "check-circle" : "info"}
                size={20}
                color={canComplete ? "#10B981" : "#6B7280"}
              />
              <Text style={[
                styles.requirementText,
                canComplete && styles.requirementMet
              ]}>
                {canComplete
                  ? `Configuración completa (${members.filter(m => m.name.trim()).length} miembros)`
                  : `Mínimo 2 miembros requeridos (${members.filter(m => m.name.trim()).length}/2)`
                }
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.completeButton,
                !canComplete && styles.disabledButton
              ]}
              onPress={handleComplete}
              disabled={!canComplete}
            >
              <Text style={styles.completeButtonText}>Continuar</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '95%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  membersContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  removeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FEF2F2',
  },
  memberContent: {
    gap: 12,
  },
  emojiSection: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emojiContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  emojiOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedEmoji: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  emojiText: {
    fontSize: 20,
  },
  nameSection: {
    gap: 8,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: 'white',
  },
  validInput: {
    borderColor: '#10B981',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addMemberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  requirementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  requirementMet: {
    color: '#10B981',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default FamilySetupModal;
