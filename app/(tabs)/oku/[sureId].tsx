// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../../store';

// 1. KORUMA: Veritabanı kasası. Sadece 1 kere bağlanır, bir daha motoru yormaz!
let dbInstance = null;
const getDb = () => {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('kuran_yeni.sqlite');
  }
  return dbInstance;
};

export default function OkumaEkrani() {
  const insets = useSafeAreaInsets(); // Sistem saatinin/çentiğin boyutunu otomatik hesaplar
  const router = useRouter();
  const { sureId, hedefAyet } = useLocalSearchParams();
  // Filtreleri store'dan çekiyoruz
  const { 
    yaziBoyutu, setYaziBoyutu, 
    seciliYazarlar, setSonOkunan,
    arapcaGoster, kelimeGoster, karanlikMod 
  } = useStore();
  
  const [ayetler, setAyetler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const flatListRef = useRef(null);

  const SURE_ADLARI = ["", "Fatiha", "Bakara", "Âl-i İmrân", "Nisâ", "Mâide", "En'âm", "A'râf", "Enfâl", "Tevbe", "Yûnus", "Hûd", "Yûsuf", "Ra'd", "İbrâhîm", "Hicr", "Nahl", "İsrâ", "Kehf", "Meryem", "Tâhâ", "Enbiyâ", "Hac", "Mü'minûn", "Nûr", "Furkân", "Şuarâ", "Neml", "Kasas", "Ankebût", "Rûm", "Lokmân", "Secde", "Ahzâb", "Sebe'", "Fâtır", "Yâsîn", "Sâffât", "Sâd", "Zümer", "Mü'min", "Fussilet", "Şûrâ", "Zuhruf", "Duhân", "Câsiye", "Ahkâf", "Muhammed", "Fetih", "Hucurât", "Kâf", "Zâriyât", "Tûr", "Necm", "Kamer", "Rahmân", "Vâkıa", "Hadîd", "Mücâdele", "Haşr", "Mümtehine", "Saf", "Cuma", "Münâfikûn", "Teğâbün", "Talâk", "Tahrîm", "Mülk", "Kalem", "Hâkka", "Meâric", "Nûh", "Cin", "Müzzemmil", "Müddessir", "Kıyâme", "İnsân", "Mürselât", "Nebe'", "Nâziât", "Abese", "Tekvîr", "İnfitâr", "Mutaffifîn", "İnşikâk", "Bürûc", "Târık", "A'lâ", "Gâşiye", "Fecr", "Beled", "Şems", "Leyl", "Duhâ", "İnşirâh", "Tîn", "Alak", "Kadr", "Beyyine", "Zilzâl", "Âdiyât", "Kâria", "Tekâsür", "Asr", "Hümeze", "Fîl", "Kureyş", "Mâûn", "Kevser", "Kâfirûn", "Nasr", "Tebbet", "İhlâs", "Felak", "Nâs"];

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const ekrandakiVeri = viewableItems[0].item; 
      if (ekrandakiVeri && ekrandakiVeri.sure_no && ekrandakiVeri.ayet_no) {
        const sureAdi = SURE_ADLARI[ekrandakiVeri.sure_no];
        // Zustand'ın fonksiyonunu doğrudan çağırıyoruz (Veri kaybını %100 önler)
        useStore.getState().setSonOkunan(ekrandakiVeri.sure_no, ekrandakiVeri.ayet_no, `${ekrandakiVeri.sure_no}. ${sureAdi} Suresi`);
      }
    }
  }).current;

  // ÇÖZÜM BURADA: Ayet kutuları ekranı aşacak kadar uzun olduğu için kuralı esnettik
  const viewabilityConfig = useRef({ 
    itemVisiblePercentThreshold: 10, // Kutunun sadece %10'u ekrana girse bile algıla
    minimumViewTime: 250 // Saniyenin çeyreği kadar ekranda durursa kaydet (Hızlıca aşağı kaydırmaları atlar)
  }).current;

  useEffect(() => {
    if (sureId) verileriGetir();
  }, [sureId, hedefAyet, seciliYazarlar]);

  const verileriGetir = () => {
    // 1. KORUMA KALKANI: Eğer ayarlar açıldığında Expo sureId'yi unutursa, listeyi boşaltmasını engelliyoruz!
    if (!sureId) return;

    setYukleniyor(true);
    // 2. KORUMA KALKANI: setAyetler([]) komutunu tamamen SİLDİK! 
    // Böylece filtre değiştirirken ekran asla bembeyaz (boş) kalmayacak.
    
    try {
      // 2. KORUMA: Artık yeni bağlantı açmıyoruz, yukarıdaki kasadan hazır olanı alıyoruz!
      const db = getDb();

      const idStr = Array.isArray(sureId) ? sureId[0] : sureId;
      const queryId = parseInt(idStr, 10);
      
      if (isNaN(queryId) || queryId < 1 || queryId > 114) {
        setYukleniyor(false); return;
      }

      const yazarlar = Array.isArray(seciliYazarlar) ? seciliYazarlar : [];
      const temizYazarlar = yazarlar.filter(y => y && typeof y === 'string' && y.trim() !== '');

      const ayetlerResult = db.getAllSync(`SELECT * FROM Ayetler WHERE sure_no = ?`, [queryId]);
      const kelimelerResult = db.getAllSync(`SELECT * FROM Kelimeler WHERE sure_no = ?`, [queryId]);
      
      let meallerResult = [];
      if (temizYazarlar.length > 0) {
        const placeholders = temizYazarlar.map(() => '?').join(',');
        // 2. YENİ TABLO SÜTUNU: "yazar_adi" kullanıyoruz
        const sql = `SELECT * FROM Mealler WHERE sure_no = ? AND yazar_adi IN (${placeholders}) ORDER BY yazar_adi ASC`;
        const queryParams = [queryId, ...temizYazarlar];
        meallerResult = db.getAllSync(sql, queryParams);
      }

      const birlestirilmisVeri = ayetlerResult.map(ayet => ({
        ...ayet,
        kelimeler: kelimelerResult.filter(k => k.ayet_no === ayet.ayet_no),
        mealler: meallerResult.filter(m => m.ayet_no === ayet.ayet_no)
      }));

      setAyetler(birlestirilmisVeri);
      setYukleniyor(false);
      
      if (hedefAyet) {
        const hAyetNo = parseInt(Array.isArray(hedefAyet) ? hedefAyet[0] : hedefAyet, 10);
        const index = birlestirilmisVeri.findIndex(a => a.ayet_no === hAyetNo);
        if (index !== -1) {
          setTimeout(() => {
            if (flatListRef.current) flatListRef.current.scrollToIndex({ index: index, animated: false, viewPosition: 0 });
          }, 500); 
        }
        // Kamera Yedeği: Hedef ayete gidilirse o ayeti kaydet
        setSonOkunan(queryId, hAyetNo, `${queryId}. ${SURE_ADLARI[queryId]} Suresi`);
      } 
    } catch (error) {
      console.warn("Veri çekme sırasında hata:", error);
      setYukleniyor(false);
    }
  };

  // Dinamik Temalar
  const themeBg = karanlikMod ? '#121212' : '#f5f6fa';
  const cardBg = karanlikMod ? '#1E1E1E' : 'white';
  const textColor = karanlikMod ? '#E0E0E0' : '#222';
  const subTextColor = karanlikMod ? '#A0A0A0' : '#555';
  const borderColor = karanlikMod ? '#333' : '#eee';
  const wordBg = karanlikMod ? '#2C2C2C' : '#fff';
  const wordContainerBg = karanlikMod ? '#1A1A1A' : '#f9f9f9';

  const renderAyet = ({ item }) => (
    <View style={[styles.ayetKutusu, { backgroundColor: cardBg }]}>
      
      {/* Ayet Numarası HER ZAMAN GÖRÜNECEK */}
      <View style={[styles.ustKisim, { borderBottomColor: borderColor }]}>
        <Text style={styles.ayetNoBadge}>{item.ayet_no}</Text>
        
        {/* 3. FİLTRE: Sadece Arapça ve Okunuş kısmı filtreye tabi olacak */}
        {arapcaGoster && (
          <>
            <Text style={[styles.arapcaMetin, { fontSize: yaziBoyutu + 8, color: textColor }]}>{item.arapca}</Text>
            <Text style={[styles.okunusMetin, { fontSize: yaziBoyutu, color: subTextColor }]}>{item.okunus}</Text>
          </>
        )}
      </View>

      {/* 4. FİLTRE: Kelime analiz kısmı 'kelimeGoster' true ise render edilir */}
      {kelimeGoster && (
        <View style={[styles.kelimeKutusu, { backgroundColor: wordContainerBg }]}>
          <View style={styles.kelimelerWrapper}>
            {item.kelimeler.map((kelime, index) => (
              <View key={index} style={[styles.tekilKelime, { backgroundColor: wordBg, borderColor: borderColor }]}>
                <Text style={[styles.kelimeArapca, { fontSize: yaziBoyutu - 2, color: textColor }]}>{kelime.latin_ve_arapca}</Text>
                <Text style={[styles.kelimeAnlam, { fontSize: yaziBoyutu - 4, color: subTextColor }]}>{kelime.anlam}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.meallerKutusu}>
         {item.mealler.map((meal, index) => (
           <View key={index} style={styles.tekilMeal}>
              <Text style={[styles.yazarIsmi, { color: '#4CAF50' }]}>{meal.yazar_adi}</Text>
              <Text style={[styles.mealMetni, { fontSize: yaziBoyutu, color: textColor }]}>{meal.meal_metni}</Text>
           </View>
         ))}
      </View>
    </View>
  );

  if (yukleniyor) return <View style={[styles.merkez, { backgroundColor: themeBg }]}><ActivityIndicator size="large" color="#4CAF50" /></View>;

  const sNo = parseInt(Array.isArray(sureId) ? sureId[0] : sureId, 10);
  const sureEkraniBaslik = (sNo > 0 && sNo <= 114) ? `${sNo}. ${SURE_ADLARI[sNo]} Suresi` : `${sNo}. Sure`;

  return (
    <View style={[styles.container, { backgroundColor: themeBg }]}>
      {/* 1. YENİ: Expo'nun o üstteki devasa barını tamamen gizliyoruz! */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 2. YENİ: Özel barımız. İçine Geri butonunu, sure adını ve font butonlarını koyduk */}
      <View style={[styles.ustAyarlar, { 
        backgroundColor: cardBg, 
        borderBottomColor: borderColor, 
        paddingTop: insets.top + 10 // Barı saat hizasından güvenli bir şekilde aşağı iter
      }]}>
        
        {/* Sol Taraf: Geri Butonu ve Sure Adı */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ padding: 5, marginRight: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.sureBaslik, { color: textColor }]} numberOfLines={1}>
            {sureEkraniBaslik}
          </Text>
        </View>

        {/* Sağ Taraf: Font Butonları */}
        <View style={styles.fontAyarKutusu}>
          <TouchableOpacity onPress={() => setYaziBoyutu(Math.max(12, yaziBoyutu - 2))} style={[styles.fontButon, { backgroundColor: karanlikMod ? '#2A3B2A' : '#E8F5E9' }]}>
            <Text style={styles.fontButonYazi}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setYaziBoyutu(Math.min(30, yaziBoyutu + 2))} style={[styles.fontButon, { backgroundColor: karanlikMod ? '#2A3B2A' : '#E8F5E9' }]}>
            <Text style={styles.fontButonYazi}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={ayetler}
        keyExtractor={(item) => item.ayet_no.toString()}
        renderItem={renderAyet}
        contentContainerStyle={{ padding: 15 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={info => {
          // 1. Önce tahmini olarak o bölgeye kaydırıp FlatList'i orayı çizmeye zorluyoruz
          const offset = (info.averageItemLength || 500) * info.index;
          flatListRef.current?.scrollToOffset({ offset, animated: false });
          
          // 2. O bölge saniyeler içinde çizildikten sonra tam nokta atışı gidiyoruz
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: false, viewPosition: 0 });
          }, 200);
        }}
      />
    </View>
  );
}

// Stillerin ana iskeleti - Renkler yukarıda dinamik olarak verildi
const styles = StyleSheet.create({
  container: { flex: 1 },
  merkez: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ustAyarlar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  sureBaslik: { fontSize: 18, fontWeight: 'bold' },
  fontAyarKutusu: { flexDirection: 'row' },
  fontButon: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5, marginLeft: 10 },
  fontButonYazi: { color: '#4CAF50', fontWeight: 'bold' },
  ayetKutusu: { borderRadius: 10, padding: 15, marginBottom: 20, elevation: 2 },
  ustKisim: { borderBottomWidth: 1, paddingBottom: 15, marginBottom: 15, alignItems: 'center' },
  ayetNoBadge: { backgroundColor: '#4CAF50', color: 'white', width: 30, height: 30, borderRadius: 15, textAlign: 'center', lineHeight: 30, fontWeight: 'bold', marginBottom: 10, overflow: 'hidden' },
  arapcaMetin: { textAlign: 'right', writingDirection: 'rtl', marginBottom: 10, lineHeight: 45 },
  okunusMetin: { fontStyle: 'italic', textAlign: 'center' },
  kelimeKutusu: { marginBottom: 15, padding: 10, borderRadius: 8 },
  kelimelerWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  tekilKelime: { borderWidth: 1, borderRadius: 5, padding: 5, margin: 4, alignItems: 'center' },
  kelimeArapca: { fontWeight: 'bold' },
  kelimeAnlam: { marginTop: 2 },
  meallerKutusu: {},
  tekilMeal: { marginBottom: 15, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: '#4CAF50' },
  yazarIsmi: { fontSize: 12, fontWeight: 'bold', marginBottom: 3 },
  mealMetni: { lineHeight: 24 }
});