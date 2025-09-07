import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FamilyMember {
  id: string;
  name: string;
  emoji: string;
  isActive: boolean;
}

interface FamilyStoreState {
  familyMembers: FamilyMember[];
  isFamilyConfigured: boolean;
  setFamilyMembers: (members: FamilyMember[]) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;
  toggleFamilyMember: (id: string) => void;
  loadFamilyMembers: () => Promise<void>;
  saveFamilyMembers: (members: FamilyMember[]) => Promise<void>;
  checkFamilyConfiguration: () => boolean;
}

const STORAGE_KEY = "@qplanning_family_members";

export const useFamilyStore = create<FamilyStoreState>((set, get) => ({
  familyMembers: [],
  isFamilyConfigured: false,
  
  setFamilyMembers: async (members) => {
    set({ familyMembers: members });
    await get().saveFamilyMembers(members);
    set({ isFamilyConfigured: get().checkFamilyConfiguration() });
  },
  
  addFamilyMember: async (member) => {
    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString(),
    };
    const updatedMembers = [...get().familyMembers, newMember];
    await get().setFamilyMembers(updatedMembers);
  },
  
  updateFamilyMember: async (id, updates) => {
    const updatedMembers = get().familyMembers.map(member =>
      member.id === id ? { ...member, ...updates } : member
    );
    await get().setFamilyMembers(updatedMembers);
  },
  
  deleteFamilyMember: async (id) => {
    const updatedMembers = get().familyMembers.filter(member => member.id !== id);
    await get().setFamilyMembers(updatedMembers);
  },
  
  toggleFamilyMember: async (id) => {
    const updatedMembers = get().familyMembers.map(member =>
      member.id === id ? { ...member, isActive: !member.isActive } : member
    );
    await get().setFamilyMembers(updatedMembers);
  },
  
  loadFamilyMembers: async () => {
    try {
      const storedMembers = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMembers) {
        const members = JSON.parse(storedMembers);
        set({ 
          familyMembers: members,
          isFamilyConfigured: get().checkFamilyConfiguration()
        });
      } else {
        set({ 
          familyMembers: [],
          isFamilyConfigured: false
        });
      }
    } catch (error) {
      console.error("Error cargando miembros de familia:", error);
      set({ 
        familyMembers: [],
        isFamilyConfigured: false
      });
    }
  },
  
  saveFamilyMembers: async (members) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch (error) {
      console.error("Error guardando miembros de familia:", error);
    }
  },
  
  checkFamilyConfiguration: () => {
    const activeMembers = get().familyMembers.filter(member => member.isActive);
    return activeMembers.length >= 1;
  },
}));
