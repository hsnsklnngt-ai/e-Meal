// @ts-nocheck
import { Stack, useLocalSearchParams } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../../store';

// ULTRA ÇÖZÜM: Bağlantıyı sayfanın DIŞINA çıkardık. 
// Artık her aramada yeni bağlantı açılıp sistem şişmeyecek. Tek, kalıcı ve sarsılmaz bir bağlantı!
const db = SQLite.openDatabaseSync('kuran.db');

export default function OkumaEkrani() {
  const { sureId, hedefAyet } = useLocalSearchParams();
  const { yaziBoyutu, setYaziBoyutu, seciliYazarlar, setSonOkunan } = useStore();
  const [ayetler, setAyetler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  const flatListRef = useRef(null);

  // Sure isimleri sözlüğü (1. sıranın Fatiha'ya denk gelmesi için başa boşluk koyduk)
  const SURE_ADLARI = ["", "Fatiha", "Bakara", "Âl-i İmrân", "Nisâ", "Mâide", "En'âm", "A'râf", "Enfâl", "Tevbe", "Yûnus", "Hûd", "Yûsuf", "Ra'd", "İbrâhîm", "Hicr", "Nahl", "İsrâ", "Kehf", "Meryem", "Tâhâ", "Enbiyâ", "Hac", "Mü'minûn", "Nûr", "Furkân", "Şuarâ", "Neml", "Kasas", "Ankebût", "Rûm", "Lokmân", "Secde", "Ahzâb", "Sebe'", "Fâtır", "Yâsîn", "Sâffât", "Sâd", "Zümer", "Mü'min", "Fussilet", "Şûrâ", "Zuhruf", "Duhân", "Câsiye", "Ahkâf", "Muhammed", "Fetih", "Hucurât", "Kâf", "Zâriyât", "Tûr", "Necm", "Kamer", "Rahmân", "Vâkıa", "Hadîd", "Mücâdele", "Haşr", "Mümtehine", "Saf", "Cuma", "Münâfikûn", "Teğâbün", "Talâk", "Tahrîm", "Mülk", "Kalem", "Hâkka", "Meâric", "Nûh", "Cin", "Müzzemmil", "Müddessir", "Kıyâme", "İnsân", "Mürselât", "Nebe'", "Nâziât", "Abese", "Tekvîr", "İnfitâr", "Mutaffifîn", "İnşikâk", "Bürûc", "Târık", "A'lâ", "Gâşiye", "Fecr", "Beled", "Şems", "Leyl", "Duhâ", "İnşirâh", "Tîn", "Alak", "Kadr", "Beyyine", "Zilzâl", "Âdiyât", "Kâria", "Tekâsür", "Asr", "Hümeze", "Fîl", "Kureyş", "Mâûn", "Kevser", "Kâfirûn", "Nasr", "Tebbet", "İhlâs", "Felak", "Nâs"];

  // 1. KAMERA: Ekranda (üstte) hangi ayet varsa onu anlık olarak hafızaya kaydeder
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const ekrandakiVeri = viewableItems[0].item; 
      if (ekrandakiVeri && ekrandakiVeri.sure && ekrandakiVeri.ayet) {
        const sureAdi = SURE_ADLARI[ekrandakiVeri.sure];
        setSonOkunan(ekrandakiVeri.sure, ekrandakiVeri.ayet, `${ekrandakiVeri.sure}. ${sureAdi} Suresi`);
      }
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  useEffect(() => {
    if (sureId) {
      verileriGetir();
    }
  }, [sureId, hedefAyet]);

  const verileriGetir = () => {
    setYukleniyor(true);
    setAyetler([]); 
    
    try {
      const idStr = Array.isArray(sureId) ? sureId[0] : sureId;
      const queryId = parseInt(idStr, 10);
      
      if (isNaN(queryId) || queryId < 1 || queryId > 114) {
        setYukleniyor(false);
        return;
      }

      const yazarlar = Array.isArray(seciliYazarlar) ? seciliYazarlar : [];
      const temizYazarlar = yazarlar.filter(y => y && typeof y === 'string' && y.trim() !== '');

      // Argümanları her zaman DİZİ [] içinde göndererek sorguyu sağlama alıyoruz
      const ayetlerResult = db.getAllSync(`SELECT * FROM Ayetler WHERE sure = ?`, [queryId]);
      const kelimelerResult = db.getAllSync(`SELECT * FROM Kelimeler WHERE sure = ?`, [queryId]);
      
      let meallerResult = [];
      if (temizYazarlar.length > 0) {
        const placeholders = temizYazarlar.map(() => '?').join(',');
        const sql = `SELECT * FROM Mealler WHERE sure = ? AND yazar_kodu IN (${placeholders})`;
        const queryParams = [queryId, ...temizYazarlar];
        meallerResult = db.getAllSync(sql, queryParams);
      }

      const birlestirilmisVeri = ayetlerResult.map(ayet => ({
        ...ayet,
        kelimeler: kelimelerResult.filter(k => k.ayet === ayet.ayet),
        mealler: meallerResult.filter(m => m.ayet === ayet.ayet)
      }));

      setAyetler(birlestirilmisVeri);
      setYukleniyor(false);
      
      if (hedefAyet) {
        const hAyetStr = Array.isArray(hedefAyet) ? hedefAyet[0] : hedefAyet;
        const hAyetNo = parseInt(hAyetStr, 10);
        
        const index = birlestirilmisVeri.findIndex(a => a.ayet === hAyetNo);
        
        if (index !== -1) {
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({ index: index, animated: false, viewPosition: 0 });
            }
          }, 500); 
        }
        // DİKKAT: setSonOkunan'ı buradan sildik. Artık kaydırdıkça otomatik güncelleniyor.
      }

    } catch (error) {
      console.warn("Veri çekme sırasında hata:", error);
      setYukleniyor(false);
    }
  };

  const renderAyet = ({ item }) => (
    <View style={styles.ayetKutusu}>
      <View style={styles.ustKisim}>
        <Text style={styles.ayetNoBadge}>{item.ayet}</Text>
        <Text style={[styles.arapcaMetin, { fontSize: yaziBoyutu + 8 }]}>{item.arapca}</Text>
        <Text style={[styles.okunusMetin, { fontSize: yaziBoyutu }]}>{item.okunus}</Text>
      </View>

      <View style={styles.kelimeKutusu}>
        <View style={styles.kelimelerWrapper}>
          {item.kelimeler.map((kelime, index) => (
            <View key={index} style={styles.tekilKelime}>
              <Text style={[styles.kelimeArapca, { fontSize: yaziBoyutu - 2 }]}>{kelime.latin_ve_arapca}</Text>
              <Text style={[styles.kelimeAnlam, { fontSize: yaziBoyutu - 4 }]}>{kelime.anlam}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.meallerKutusu}>
         {item.mealler.map((meal, index) => (
           <View key={index} style={styles.tekilMeal}>
              <Text style={styles.yazarIsmi}>{meal.yazar_kodu.toUpperCase()}</Text>
              <Text style={[styles.mealMetni, { fontSize: yaziBoyutu }]}>{meal.meal_metni}</Text>
           </View>
         ))}
      </View>
    </View>
  );

  if (yukleniyor) {
    return (
      <View style={styles.merkez}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Sayfadaki numara ve sure adını güvenli şekilde oluşturuyoruz
  const sNo = parseInt(Array.isArray(sureId) ? sureId[0] : sureId, 10);
  const sureEkraniBaslik = (sNo > 0 && sNo <= 114) ? `${sNo}. ${SURE_ADLARI[sNo]} Suresi` : `${sNo}. Sure`;

  return (
    <View style={styles.container}>
      {/* Üst barı burada güvenle e-Meal olarak değiştiriyoruz */}
      <Stack.Screen options={{ title: 'e-Meal', headerBackTitle: 'Geri' }} />
      
      <View style={styles.ustAyarlar}>
        {/* 2. ÇÖZÜM: Absürt "1. Sure" yazısı yerine "1. Fatiha Suresi" yazdırıyoruz */}
        <Text style={styles.sureBaslik}>{sureEkraniBaslik}</Text>
        <View style={styles.fontAyarKutusu}>
          <TouchableOpacity onPress={() => setYaziBoyutu(Math.max(12, yaziBoyutu - 2))} style={styles.fontButon}>
            <Text style={styles.fontButonYazi}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setYaziBoyutu(Math.min(30, yaziBoyutu + 2))} style={styles.fontButon}>
            <Text style={styles.fontButonYazi}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={ayetler}
        keyExtractor={(item) => item.ayet.toString()}
        renderItem={renderAyet}
        contentContainerStyle={{ padding: 15 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: false, viewPosition: 0 });
          }, 300);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  merkez: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ustAyarlar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  sureBaslik: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  fontAyarKutusu: { flexDirection: 'row' },
  fontButon: { backgroundColor: '#E8F5E9', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5, marginLeft: 10 },
  fontButonYazi: { color: '#4CAF50', fontWeight: 'bold' },
  ayetKutusu: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 20, elevation: 2 },
  ustKisim: { borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 15, marginBottom: 15, alignItems: 'center' },
  ayetNoBadge: { backgroundColor: '#4CAF50', color: 'white', width: 30, height: 30, borderRadius: 15, textAlign: 'center', lineHeight: 30, fontWeight: 'bold', marginBottom: 10, overflow: 'hidden' },
  arapcaMetin: { textAlign: 'right', writingDirection: 'rtl', marginBottom: 10, lineHeight: 45 },
  okunusMetin: { color: '#555', fontStyle: 'italic', textAlign: 'center' },
  kelimeKutusu: { marginBottom: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 },
  kelimelerWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  tekilKelime: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 5, padding: 5, margin: 4, alignItems: 'center' },
  kelimeArapca: { fontWeight: 'bold' },
  kelimeAnlam: { color: '#666', marginTop: 2 },
  meallerKutusu: {},
  tekilMeal: { marginBottom: 15, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: '#4CAF50' },
  yazarIsmi: { fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 3 },
  mealMetni: { lineHeight: 24, color: '#222' }
});