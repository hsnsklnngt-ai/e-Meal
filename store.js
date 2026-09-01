import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// persist (kalıcılık) sarmalayıcısını ekliyoruz
export const useStore = create(
  persist(
    (set) => ({
      yaziBoyutu: 16,
      setYaziBoyutu: (boyut) => set({ yaziBoyutu: boyut }),
      
      seciliYazarlar: [
        "Ahmet Varol", "Ali Bulaç", "Bayraktar Bayraklı", "Cemal Külünkoğlu",
        "Diyanet İşleri (eski)", "Elmalılı Hamdi Yazır", "Erhan Aktaş", "Hakkı Yılmaz",
        "Hasan Basri Çantay", "İbni Kesir", "Mehmet Okuyan", "Ömer Nasuhi Bilmen",
        "Seyyid Kutub", "Süleyman Ateş", "Süleymaniye Vakfı", "Yaşar Nuri Öztürk"
      ], 
      setSeciliYazarlar: (yazarlar) => set({ seciliYazarlar: yazarlar }),

      sonOkunan: null,
      setSonOkunan: (sure, ayet, sureAd) => set({ sonOkunan: { sure, ayet, sureAd } }),

      arapcaGoster: true,
      setArapcaGoster: (deger) => set({ arapcaGoster: deger }),
      
      kelimeGoster: true,
      setKelimeGoster: (deger) => set({ kelimeGoster: deger }),

      karanlikMod: false,
      setKaranlikMod: (deger) => set({ karanlikMod: deger }),

      inisSirasinaGore: false,
      setInisSirasinaGore: (deger) => set({ inisSirasinaGore: deger }),
    }),
    {
      name: 'kuran-ayarlar-hafizasi', // AsyncStorage'da bu isimle kaydedilir
      storage: createJSONStorage(() => AsyncStorage), // Depolama motoru olarak AsyncStorage kullan
    }
  )
);