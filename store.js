import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // Varsayılan ayarlar
      yaziBoyutu: 16,
      setYaziBoyutu: (boyut) => set({ yaziBoyutu: boyut }),
      
      seciliYazarlar: ['meal1', 'meal5'],
      setSeciliYazarlar: (yazarlar) => set({ seciliYazarlar: yazarlar }),
      
      sonOkunan: null, // Örnek: { sure: 1, ayet: 2, sureAd: "Fatiha" }
      setSonOkunan: (sure, ayet, sureAd) => set({ sonOkunan: { sure, ayet, sureAd } }),
    }),
    {
      name: 'e-meal-hafiza', // Cihaza bu isimle kaydedilecek
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);