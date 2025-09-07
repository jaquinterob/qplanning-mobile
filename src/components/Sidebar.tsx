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

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose }) => {
  const {
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    toggleFamilyMember,
    checkFamilyConfiguration,
  } = useFamilyStore();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmoji, setNewMemberEmoji] = useState('👤');
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof emojiCategories>('personas');

  const emojiCategories = {
    personas: {
      title: 'Personas',
      emojis: [
        // Emojis neutros
        '👤', '🧑', '👨', '👩', '👦', '👧',
        // Piel clara
        '👨🏻', '👩🏻', '👦🏻', '👧🏻', '👴🏻', '👵🏻',
        // Piel clara-media
        '👨🏼', '👩🏼', '👦🏼', '👧🏼', '👴🏼', '👵🏼',
        // Piel media
        '👨🏽', '👩🏽', '👦🏽', '👧🏽', '👴🏽', '👵🏽',
        // Piel media-oscura
        '👨🏾', '👩🏾', '👦🏾', '👧🏾', '👴🏾', '👵🏾',
        // Piel oscura
        '👨🏿', '👩🏿', '👦🏿', '👧🏿', '👴🏿', '👵🏿',
        // Cabello diverso
        '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲'
      ]
    },
    bebes: {
      title: 'Bebés',
      emojis: [
        '👶', '👶🏻', '👶🏼', '👶🏽', '👶🏾', '👶🏿',
        '🍼', '🧸', '👶‍👶', '👶‍👦', '👶‍👧'
      ]
    },
    animales: {
      title: 'Animalitos',
      emojis: [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
        '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
        '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
        '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎',
        '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟',
        '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧',
        '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄',
        '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮',
        '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇',
        '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'
      ]
    }
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      addFamilyMember({
        name: newMemberName.trim(),
        emoji: newMemberEmoji,
        isActive: true,
      });
      setNewMemberName('');
      setNewMemberEmoji('👤');
      setIsAddModalVisible(false);
    } else {
      Alert.alert('Error', 'Por favor ingresa un nombre para el miembro');
    }
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setNewMemberName(member.name);
    setNewMemberEmoji(member.emoji);
    setIsAddModalVisible(true);
  };

  const handleUpdateMember = () => {
    if (editingMember && newMemberName.trim()) {
      updateFamilyMember(editingMember.id, {
        name: newMemberName.trim(),
        emoji: newMemberEmoji,
      });
      setEditingMember(null);
      setNewMemberName('');
      setNewMemberEmoji('👤');
      setIsAddModalVisible(false);
    }
  };

  const handleDeleteMember = (member: FamilyMember) => {
    Alert.alert(
      'Eliminar Miembro',
      `¿Estás seguro de que quieres eliminar a ${member.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteFamilyMember(member.id),
        },
      ]
    );
  };

  const isConfigured = checkFamilyConfiguration();

  return (
    <>
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.sidebar}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Configuración de Familia</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Status */}
            <View style={[styles.statusContainer, !isConfigured && styles.statusError]}>
              <MaterialIcons
                name={isConfigured ? "check-circle" : "warning"}
                size={20}
                color={isConfigured ? "#10B981" : "#EF4444"}
              />
              <Text style={[styles.statusText, !isConfigured && styles.statusErrorText]}>
                {isConfigured
                  ? `Configuración completa (${familyMembers.filter(m => m.isActive).length} miembros)`
                  : `Mínimo 2 miembros requeridos (${familyMembers.filter(m => m.isActive).length}/2)`
                }
              </Text>
            </View>

            {/* Members List */}
            <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
              {familyMembers.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <TouchableOpacity
                      style={styles.toggleButton}
                      onPress={() => toggleFamilyMember(member.id)}
                    >
                      <MaterialIcons
                        name={member.isActive ? "check-box" : "check-box-outline-blank"}
                        size={24}
                        color={member.isActive ? "#6366F1" : "#9CA3AF"}
                      />
                    </TouchableOpacity>
                    
                    <Text style={styles.memberEmoji}>{member.emoji}</Text>
                    <Text style={[
                      styles.memberName,
                      !member.isActive && styles.inactiveMember
                    ]}>
                      {member.name}
                    </Text>
                  </View>

                  <View style={styles.memberActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditMember(member)}
                    >
                      <MaterialIcons name="edit" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteMember(member)}
                    >
                      <MaterialIcons name="delete" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {familyMembers.length === 0 && (
                <View style={styles.emptyState}>
                  <MaterialIcons name="family-restroom" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No hay miembros configurados</Text>
                  <Text style={styles.emptySubtext}>
                    Agrega al menos 2 miembros para poder asignar tareas
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setEditingMember(null);
                setNewMemberName('');
                setNewMemberEmoji('👤');
                setIsAddModalVisible(true);
              }}
            >
              <MaterialIcons name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>Agregar Miembro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Member Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMember ? 'Editar Miembro' : 'Agregar Miembro'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsAddModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Emoji Selection */}
              <View style={styles.emojiSection}>
                <Text style={styles.sectionTitle}>Emoji</Text>
                
                {/* Category Tabs */}
                <View style={styles.categoryTabs}>
                  {Object.entries(emojiCategories).map(([key, category]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.categoryTab,
                        selectedCategory === key && styles.activeCategoryTab
                      ]}
                      onPress={() => setSelectedCategory(key as keyof typeof emojiCategories)}
                    >
                      <Text style={[
                        styles.categoryTabText,
                        selectedCategory === key && styles.activeCategoryTabText
                      ]}>
                        {category.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Emoji Grid */}
                <ScrollView style={styles.emojiGrid} showsVerticalScrollIndicator={false}>
                  <View style={styles.emojiContainer}>
                    {emojiCategories[selectedCategory].emojis.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[
                          styles.emojiOption,
                          newMemberEmoji === emoji && styles.selectedEmoji
                        ]}
                        onPress={() => setNewMemberEmoji(emoji)}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Name Input */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Nombre</Text>
                <TextInput
                  style={styles.nameInput}
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                  placeholder="Nombre del miembro"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, !newMemberName.trim() && styles.disabledButton]}
                onPress={editingMember ? handleUpdateMember : handleAddMember}
                disabled={!newMemberName.trim()}
              >
                <Text style={styles.saveButtonText}>
                  {editingMember ? 'Actualizar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  sidebar: {
    width: screenWidth * 0.85,
    backgroundColor: 'white',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  statusErrorText: {
    color: '#DC2626',
  },
  membersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleButton: {
    marginRight: 12,
  },
  memberEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  inactiveMember: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  emojiSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
    padding: 4,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeCategoryTab: {
    backgroundColor: '#6366F1',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeCategoryTabText: {
    color: 'white',
    fontWeight: '600',
  },
  emojiGrid: {
    maxHeight: 120,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmoji: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  emojiText: {
    fontSize: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: '#F9FAFB',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default Sidebar;
