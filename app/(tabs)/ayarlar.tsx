// @ts-nocheck
// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../../store';

// SABİT 16 YAZAR LİSTESİ (Alfabetik)[cite: 3]
const YAZARLAR = [
  "Ahmet Varol", "Ali Bulaç", "Bayraktar Bayraklı", "Cemal Külünkoğlu",
  "Diyanet İşleri (eski)", "Elmalılı Hamdi Yazır", "Erhan Aktaş", "Hakkı Yılmaz",
  "Hasan Basri Çantay", "İbni Kesir", "Mehmet Okuyan", "Ömer Nasuhi Bilmen",
  "Seyyid Kutub", "Süleyman Ateş", "Süleymaniye Vakfı", "Yaşar Nuri Öztürk"
];

export default function AyarlarEkrani() {
  const [tiklamaSayisi, setTiklamaSayisi] = useState(0);

  const gizliOdaTetikle = () => {
    const yeniSayi = tiklamaSayisi + 1;
    setTiklamaSayisi(yeniSayi);
    
    // 7. Tıklamada Gizli Mesaj Açılır!
    if (yeniSayi === 7) {
      Alert.alert(
        "Sırrı Buldunuz! 🌙",
        "\"Rabbim, ilmimi artır.\" (Tâhâ Suresi, 114)\n\nBu uygulama, Kuran'ın nurunu dijital dünyaya zarifçe taşımak için @guventunay tarafından sevgiyle kodlandı.",
        [{ text: "Eyvallah", onPress: () => setTiklamaSayisi(0) }]
      );
    }
  };

  const {
    arapcaGoster, setArapcaGoster,
    kelimeGoster, setKelimeGoster,
    karanlikMod, setKaranlikMod,
    seciliYazarlar, setSeciliYazarlar
  } = useStore();

  const yazarTetikle = (yazar) => {
    if (seciliYazarlar.includes(yazar)) {
      setSeciliYazarlar(seciliYazarlar.filter(y => y !== yazar));
    } else {
      setSeciliYazarlar([...seciliYazarlar, yazar]);
    }
  };

  const hepsiniSec = () => setSeciliYazarlar(YAZARLAR);
  const hicbiriniSecme = () => setSeciliYazarlar([]);

  // Dinamik Tema Renkleri
  const themeBg = karanlikMod ? '#121212' : '#f5f6fa';
  const cardBg = karanlikMod ? '#1E1E1E' : 'white';
  const textColor = karanlikMod ? '#E0E0E0' : '#333';
  const subTextColor = karanlikMod ? '#A0A0A0' : '#888';
  const borderColor = karanlikMod ? '#333' : '#f0f0f0';

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeBg }]} contentContainerStyle={{ paddingBottom: 40 }}>
      
      <Text style={[styles.kategoriBaslik, { color: subTextColor }]}>Görünüm Ayarları</Text>
      <View style={[styles.kutu, { backgroundColor: cardBg }]}>
        <View style={styles.ayarSatiri}>
          <View style={styles.ayarSol}>
            <Ionicons name="moon" size={20} color={subTextColor} style={styles.ikon} />
            <Text style={[styles.ayarMetin, { color: textColor }]}>Karanlık Mod</Text>
          </View>
          <Switch value={karanlikMod} onValueChange={setKaranlikMod} trackColor={{ false: '#d3d3d3', true: '#4CAF50' }} />
        </View>
      </View>

      <Text style={[styles.kategoriBaslik, { color: subTextColor }]}>Okuma Ekranı Filtreleri</Text>
      <View style={[styles.kutu, { backgroundColor: cardBg }]}>
        <View style={[styles.ayarSatiri, { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
          <View style={styles.ayarSol}>
            <Ionicons name="book" size={20} color={subTextColor} style={styles.ikon} />
            <Text style={[styles.ayarMetin, { color: textColor }]}>Arapça Metni Göster</Text>
          </View>
          <Switch value={arapcaGoster} onValueChange={setArapcaGoster} trackColor={{ false: '#d3d3d3', true: '#4CAF50' }} />
        </View>
        <View style={styles.ayarSatiri}>
          <View style={styles.ayarSol}>
            <Ionicons name="list" size={20} color={subTextColor} style={styles.ikon} />
            <Text style={[styles.ayarMetin, { color: textColor }]}>Kelime Analizini Göster</Text>
          </View>
          <Switch value={kelimeGoster} onValueChange={setKelimeGoster} trackColor={{ false: '#d3d3d3', true: '#4CAF50' }} />
        </View>
      </View>

      <View style={styles.yazarBaslikSatiri}>
        <Text style={[styles.kategoriBaslik, { color: subTextColor, marginTop: 0 }]}>Meal Yazarları</Text>
        <View style={styles.topluButonlar}>
          <TouchableOpacity onPress={hepsiniSec} style={styles.kucukButon}>
            <Text style={styles.kucukButonMetin}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={hicbiriniSecme} style={[styles.kucukButon, { backgroundColor: karanlikMod ? '#3d1c1c' : '#ffebee' }]}>
            <Text style={[styles.kucukButonMetin, { color: '#ef5350' }]}>Temizle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.kutu, { backgroundColor: cardBg }]}>
        {YAZARLAR.map((yazar, index) => {
          const seciliMi = seciliYazarlar.includes(yazar);
          return (
            <TouchableOpacity 
              key={yazar} 
              style={[styles.yazarSatiri, index !== YAZARLAR.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }]}
              onPress={() => yazarTetikle(yazar)}
            >
             <Text style={[styles.yazarAd, { color: textColor }, seciliMi && styles.yazarAdSecili]}>{yazar}</Text>
              <View style={[styles.yuvarlak, seciliMi && styles.yuvarlakSecili, karanlikMod && !seciliMi && { borderColor: '#555' }]}>
                {seciliMi && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* GELİŞTİRİCİ İMZASI VE GİZLİ ODA (EASTER EGG) */}
      <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
        {/* Gizli Buton (Nun Harfi) */}
        <TouchableOpacity activeOpacity={0.8} onPress={gizliOdaTetikle}>
          <Text style={{ fontSize: 28, color: subTextColor, opacity: 0.3, marginBottom: 10 }}>ن</Text>
        </TouchableOpacity>

        {/* Telegram İletişim İmzası */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.5 }}
          onPress={() => Linking.openURL('https://t.me/guventunay')}
        >
          <Ionicons name="paper-plane" size={14} color={subTextColor} />
          <Text style={{ marginLeft: 6, color: subTextColor, fontSize: 13, fontWeight: '500' }}>
            Geliştirici: @guventunay
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

// ... Eski styles kısmı olduğu gibi kalabilir[cite: 3] ...
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  kategoriBaslik: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginTop: 10, marginLeft: 5 },
  kutu: { borderRadius: 12, paddingVertical: 5, paddingHorizontal: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  ayarSatiri: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  ayarSol: { flexDirection: 'row', alignItems: 'center' },
  ikon: { marginRight: 10 },
  ayarMetin: { fontSize: 16, fontWeight: '500' },
  yazarBaslikSatiri: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10, marginTop: 20 },
  topluButonlar: { flexDirection: 'row', gap: 10 },
  kucukButon: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  kucukButonMetin: { color: '#4CAF50', fontWeight: 'bold', fontSize: 12 },
  yazarSatiri: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  yazarAd: { fontSize: 16 },
  yazarAdSecili: { color: '#4CAF50', fontWeight: 'bold' },
  yuvarlak: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  yuvarlakSecili: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' }
});