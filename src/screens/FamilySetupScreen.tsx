import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFamilyStore, FamilyMember } from '../store/useFamilyStore';
import { colors } from '../theme/colors';

const FamilySetupScreen: React.FC = () => {
  const { addFamilyMember, checkFamilyConfiguration } = useFamilyStore();
  const navigation = useNavigation();
  const [members, setMembers] = useState<Omit<FamilyMember, 'id'>[]>([
    { name: '', emoji: '👤', isActive: true },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof emojiCategories>('personas');
  const [showEmojiSelector, setShowEmojiSelector] = useState<number | null>(null);

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

  const updateMember = (index: number, updates: Partial<Omit<FamilyMember, 'id'>>) => {
    setMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, ...updates } : member
    ));
  };

  const addMember = () => {
    setMembers(prev => [...prev, { name: '', emoji: '👤', isActive: true }]);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleComplete = async () => {
    const validMembers = members.filter(member => member.name.trim());
    
    if (validMembers.length < 1) {
      Alert.alert('Error', 'Debes configurar al menos 1 miembro de familia');
      return;
    }

    // Agregar todos los miembros
    for (const member of validMembers) {
      await addFamilyMember(member);
    }

    if (checkFamilyConfiguration()) {
      Alert.alert(
        '¡Configuración Completada!',
        'Los miembros de familia han sido configurados exitosamente.',
        [{ 
          text: 'Continuar', 
          onPress: () => navigation.navigate('Home' as never)
        }]
      );
    } else {
      Alert.alert('Error', 'La configuración no es válida. Intenta de nuevo.');
    }
  };

  const canComplete = members.filter(member => member.name.trim()).length >= 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      {/* Minimalist Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Configura tu familia</Text>
        <Text style={styles.subtitle}>
          Agrega al menos 1 miembro para comenzar
        </Text>
      </View>

      {/* Members Configuration */}
      <ScrollView style={styles.membersContainer} showsVerticalScrollIndicator={false}>
        {members.map((member, index) => (
          <View key={index} style={styles.memberCard}>
            {/* Member Number */}
            <View style={styles.memberHeader}>
              <Text style={styles.memberNumber}>{index + 1}</Text>
              {members.length > 2 && (
                <TouchableOpacity
                  onPress={() => removeMember(index)}
                  style={styles.removeButton}
                >
                  <MaterialIcons name="close" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Member Content */}
            <View style={styles.memberContent}>
              {/* Name Input */}
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

              {/* Emoji Selection */}
              <TouchableOpacity
                style={styles.emojiSelectorButton}
                onPress={() => setShowEmojiSelector(showEmojiSelector === index ? null : index)}
              >
                <Text style={styles.currentEmoji}>{member.emoji}</Text>
                <MaterialIcons 
                  name={showEmojiSelector === index ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={18} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
              
              {showEmojiSelector === index && (
                <View style={styles.emojiSelectorContainer}>
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
                            member.emoji === emoji && styles.selectedEmoji
                          ]}
                          onPress={() => {
                            updateMember(index, { emoji });
                            setShowEmojiSelector(null);
                          }}
                        >
                          <Text style={styles.emojiText}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Add Member Button */}
        <TouchableOpacity style={styles.addMemberButton} onPress={addMember}>
          <MaterialIcons name="add" size={20} color="#6366F1" />
          <Text style={styles.addMemberText}>Agregar miembro</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Minimalist Footer */}
      <View style={styles.footer}>
        <View style={styles.requirementContainer}>
          <View style={[
            styles.statusDot,
            canComplete && styles.statusDotActive
          ]} />
          <Text style={[
            styles.requirementText,
            canComplete && styles.requirementMet
          ]}>
            {canComplete
              ? `${members.filter(m => m.name.trim()).length} miembros configurados`
              : `${members.filter(m => m.name.trim()).length}/1 miembro`
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
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  membersContainer: {
    flex: 1,
    padding: 16,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.blue.primary,
    backgroundColor: colors.blue.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 26,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  memberContent: {
    gap: 16,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.white,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  validInput: {
    borderColor: colors.success,
  },
  emojiSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  currentEmoji: {
    fontSize: 24,
  },
  emojiSelectorContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: colors.blue.light,
    borderRadius: 8,
    margin: 8,
    padding: 4,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeCategoryTab: {
    backgroundColor: colors.blue.primary,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  activeCategoryTabText: {
    color: 'white',
    fontWeight: '600',
  },
  emojiGrid: {
    maxHeight: 150,
    margin: 8,
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
    backgroundColor: colors.blue.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmoji: {
    borderColor: colors.blue.primary,
    backgroundColor: colors.blue.soft,
  },
  emojiText: {
    fontSize: 20,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 20,
  },
  addMemberText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue.primary,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  requirementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.pending,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  requirementMet: {
    color: colors.success,
  },
  completeButton: {
    backgroundColor: colors.blue.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: colors.blue.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: colors.pending,
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default FamilySetupScreen;
