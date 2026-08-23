// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { copyAsync, deleteAsync, documentDirectory, getInfoAsync, makeDirectoryAsync } from 'expo-file-system/legacy';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../../store'; // Store eklendi

export default function RootLayout() {
  const router = useRouter();
  const [dbHazir, setDbHazir] = useState(false);
  const karanlikMod = useStore((state) => state.karanlikMod); // Karanlık mod verisi çekildi

  useEffect(() => {
    async function hazirla() {
      try {
        const dbName = 'kuran_yeni.sqlite';
        const dbDir = documentDirectory + 'SQLite';
        const dbUri = dbDir + '/' + dbName;

        const dirInfo = await getInfoAsync(dbDir);
        if (!dirInfo.exists) {
          await makeDirectoryAsync(dbDir, { intermediates: true });
        }

        const dbInfo = await getInfoAsync(dbUri);
        
        // Şartı 50.000 byte (50 KB) olarak güncelledik. Boş bir DB 0-8 KB arasıdır.
        if (!dbInfo.exists || (dbInfo.exists && dbInfo.size < 50000)) {
          console.log("Veritabanı eksik veya boş, assets içinden cihaza kopyalanıyor...");
          if (dbInfo.exists) {
             await deleteAsync(dbUri, { idempotent: true });
             // YENİ: Hayalet önbellek dosyalarını da yok ediyoruz ki sistem temiz başlasın
             await deleteAsync(dbUri + '-wal', { idempotent: true });
             await deleteAsync(dbUri + '-shm', { idempotent: true });
             await deleteAsync(dbUri + '-journal', { idempotent: true });
          }
          
          const asset = await Asset.fromModule(require('../../assets/kuran_yeni.sqlite')).downloadAsync();
          if (asset.localUri) {
            await copyAsync({ from: asset.localUri, to: dbUri });
            console.log("Veritabanı başarıyla cihaza kopyalandı!");
          } else {
            console.log("HATA: Veritabanı assets'den okunamadı!");
          }
        } else {
          console.log(`Veritabanı cihazda zaten mevcut ve sağlam. Boyut: ${dbInfo.size} byte`);
        }
        
        setDbHazir(true);
      } catch (error) {
        console.warn("Veritabanı kopyalama hatası:", error);
        setDbHazir(true);
      }
    }
    hazirla();
  }, []);

  if (!dbHazir) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 15, fontSize: 16, fontWeight: 'bold', color: '#555' }}>
          Tüm Kuran Veritabanı Hazırlanıyor...
        </Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: karanlikMod ? '#1E1E1E' : '#4CAF50' }, // Dinamik Üst Bar
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'e-Meal',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/ayarlar')}
              style={{ 
                backgroundColor: karanlikMod ? '#2C2C2C' : '#fff', // Dinamik Buton Arka Planı
                flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 22, marginRight: 5, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 
              }}
            >
              <Ionicons name="settings-sharp" size={16} color="#4CAF50" style={{ marginRight: 6 }} />
              <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 16 }}>Ayarlar</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="oku/[sureId]" options={{ title: 'e-Meal', headerBackTitle: 'Geri' }} />
      <Stack.Screen 
        name="ayarlar" 
        options={{ 
          title: 'Ayarlar', 
          presentation: 'modal',
          headerStyle: { backgroundColor: karanlikMod ? '#1E1E1E' : '#4CAF50' } // Ayarlar Ekranı Üst Bar
        }} 
      />
    </Stack>
  );
}