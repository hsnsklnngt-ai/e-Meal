// @ts-nocheck
import { Asset } from 'expo-asset';
// deleteAsync eklendi
import { copyAsync, deleteAsync, documentDirectory, getInfoAsync, makeDirectoryAsync } from 'expo-file-system/legacy';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const [dbHazir, setDbHazir] = useState(false);

  useEffect(() => {
    async function hazirla() {
      try {
        const dbName = 'kuran.db';
        const dbDir = documentDirectory + 'SQLite';
        const dbUri = dbDir + '/' + dbName;

        const dirInfo = await getInfoAsync(dbDir);
        if (!dirInfo.exists) {
          await makeDirectoryAsync(dbDir, { intermediates: true });
        }

        const dbInfo = await getInfoAsync(dbUri);
        
        // ÇÖZÜM BURADA: Dosya yoksa VEYA dosya yarım kalıp bozulmuşsa (boyutu çok küçükse) silip baştan yükle
        if (!dbInfo.exists || (dbInfo.exists && dbInfo.size < 10000000)) {
          console.log("Veritabanı eksik veya bozuk, sağlamı cihaza kopyalanıyor...");
          
          // Eğer bozuk bir dosya varsa önce onu çöpe atıyoruz
          if (dbInfo.exists) {
             await deleteAsync(dbUri, { idempotent: true });
          }

          const asset = await Asset.fromModule(require('../../assets/kuran.db')).downloadAsync();
          if (asset.localUri) {
            await copyAsync({ from: asset.localUri, to: dbUri });
          }
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
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'e-Meal',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/ayarlar')}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 10 }}>Filtre</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="oku/[sureId]" options={{ title: 'e-Meal', headerBackTitle: 'Geri' }} />
      <Stack.Screen name="ayarlar" options={{ title: 'Meal Filtresi', presentation: 'modal' }} />
    </Stack>
  );
}