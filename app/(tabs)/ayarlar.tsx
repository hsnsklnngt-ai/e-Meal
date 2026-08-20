// @ts-nocheck
import React from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { useStore } from '../../store'; // store.js ana dizinde olduğu için 2 tık geri çıkıyoruz

// Senin verdiğin HTML kaynağından aldığım yazar listesi (Şimdilik ilk 10 tanesi, istersen 45'e kadar uzatabiliriz)
const TUM_YAZARLAR = [
  { id: 'meal1', ad: 'Abdulbaki Gölpınarlı' },
  { id: 'meal2', ad: 'Abdullah Parlıyan' },
  { id: 'meal3', ad: 'Adem Uğur' },
  { id: 'meal4', ad: 'Ahmed Hulusi' },
  { id: 'meal5', ad: 'Ahmet Tekin' },
  { id: 'meal6', ad: 'Ahmet Varol' },
  { id: 'meal7', ad: 'Ali Bulaç' },
  { id: 'meal8', ad: 'Ali Fikri Yavuz' },
  { id: 'meal9', ad: 'Bayraktar Bayraklı' },
  { id: 'meal10', ad: 'Bekir Sadak' },
];

export default function AyarlarEkrani() {
  // Hafızadan seçili yazarları ve onları güncelleyecek fonksiyonu çekiyoruz
  const { seciliYazarlar, setSeciliYazarlar } = useStore();

  // Switch (Aç/Kapat) butonuna basıldığında çalışacak fonksiyon
  const yazarDegistir = (yazarId) => {
    if (seciliYazarlar.includes(yazarId)) {
      // Eğer yazar zaten seçiliyse ve butona basıldıysa, onu listeden çıkar
      setSeciliYazarlar(seciliYazarlar.filter((id) => id !== yazarId));
    } else {
      // Eğer yazar seçili değilse, onu mevcut listeye ekle
      setSeciliYazarlar([...seciliYazarlar, yazarId]);
    }
  };

  const renderYazar = ({ item }) => {
    // Yazarın hafızada seçili olup olmadığını kontrol ediyoruz (True / False)
    const aktifMi = seciliYazarlar.includes(item.id);

    return (
      <View style={styles.yazarSatiri}>
        <Text style={[styles.yazarAdi, aktifMi && styles.yazarAdiAktif]}>
          {item.ad}
        </Text>
        <Switch
          value={aktifMi}
          onValueChange={() => yazarDegistir(item.id)}
          trackColor={{ false: '#d3d3d3', true: '#A5D6A7' }}
          thumbColor={aktifMi ? '#4CAF50' : '#f4f3f4'}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.baslikKutusu}>
        <Text style={styles.baslikYazi}>Meal Yazarları</Text>
        <Text style={styles.altBaslikYazi}>
          Okuma ekranında görmek istediğiniz çevirmenleri seçin.
        </Text>
      </View>

      <FlatList
        data={TUM_YAZARLAR}
        keyExtractor={(item) => item.id}
        renderItem={renderYazar}
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  
  baslikKutusu: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  baslikYazi: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  altBaslikYazi: { fontSize: 14, color: '#666' },

  yazarSatiri: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 15, 
    marginBottom: 10, 
    borderRadius: 8, 
    elevation: 1 
  },
  yazarAdi: { fontSize: 16, color: '#555' },
  yazarAdiAktif: { fontWeight: 'bold', color: '#222' }
});