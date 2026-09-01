// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

// Sıralama Referansları
const SURE_ADLARI = ["", "Fatiha", "Bakara", "Âl-i İmrân", "Nisâ", "Mâide", "En'âm", "A'râf", "Enfâl", "Tevbe", "Yûnus", "Hûd", "Yûsuf", "Ra'd", "İbrâhîm", "Hicr", "Nahl", "İsrâ", "Kehf", "Meryem", "Tâhâ", "Enbiyâ", "Hac", "Mü'minûn", "Nûr", "Furkân", "Şuarâ", "Neml", "Kasas", "Ankebût", "Rûm", "Lokmân", "Secde", "Ahzâb", "Sebe'", "Fâtır", "Yâsîn", "Sâffât", "Sâd", "Zümer", "Mü'min", "Fussilet", "Şûrâ", "Zuhruf", "Duhân", "Câsiye", "Ahkâf", "Muhammed", "Fetih", "Hucurât", "Kâf", "Zâriyât", "Tûr", "Necm", "Kamer", "Rahmân", "Vâkıa", "Hadîd", "Mücâdele", "Haşr", "Mümtehine", "Saf", "Cuma", "Münâfikûn", "Teğâbün", "Talâk", "Tahrîm", "Mülk", "Kalem", "Hâkka", "Meâric", "Nûh", "Cin", "Müzzemmil", "Müddessir", "Kıyâme", "İnsân", "Mürselât", "Nebe'", "Nâziât", "Abese", "Tekvîr", "İnfitâr", "Mutaffifîn", "İnşikâk", "Bürûc", "Târık", "A'lâ", "Gâşiye", "Fecr", "Beled", "Şems", "Leyl", "Duhâ", "İnşirâh", "Tîn", "Alak", "Kadr", "Beyyine", "Zilzâl", "Âdiyât", "Kâria", "Tekâsür", "Asr", "Hümeze", "Fîl", "Kureyş", "Mâûn", "Kevser", "Kâfirûn", "Nasr", "Tebbet", "İhlâs", "Felak", "Nâs"];
const NUZUL_SIRASI = [96, 68, 73, 74, 1, 111, 81, 87, 92, 89, 93, 94, 103, 100, 108, 102, 107, 109, 105, 113, 114, 112, 53, 80, 97, 91, 85, 95, 106, 101, 75, 104, 77, 50, 90, 86, 54, 38, 7, 72, 36, 25, 35, 19, 20, 56, 26, 27, 28, 17, 10, 11, 12, 15, 6, 37, 31, 34, 39, 40, 41, 42, 43, 44, 45, 46, 51, 88, 18, 16, 71, 14, 21, 23, 32, 52, 67, 69, 70, 78, 79, 82, 84, 30, 29, 83, 2, 8, 3, 33, 60, 4, 99, 57, 47, 13, 55, 76, 65, 98, 59, 24, 22, 63, 58, 49, 66, 64, 61, 62, 48, 5, 9, 110];

export default function OkumaEkrani() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sureId, hedefAyet } = useLocalSearchParams();
  
  const { 
    yaziBoyutu, setYaziBoyutu, 
    seciliYazarlar, setSonOkunan,
    arapcaGoster, kelimeGoster, karanlikMod,
    inisSirasinaGore 
  } = useStore();
  
  const [ayetler, setAyetler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  // YENİ: Çizginin akıcı (smooth) dolması için animasyon motoru ve toplam ayet referansı
  const progressAnim = useRef(new Animated.Value(0)).current;
  const toplamAyetRef = useRef(0);
  
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      
      // 1. Son okunan ayeti kaydetme (En üstteki ayet)
      const ekrandakiVeri = viewableItems[0].item; 
      if (ekrandakiVeri && ekrandakiVeri.sure_no && ekrandakiVeri.ayet_no) {
        const sureAdi = SURE_ADLARI[ekrandakiVeri.sure_no];
        useStore.getState().setSonOkunan(ekrandakiVeri.sure_no, ekrandakiVeri.ayet_no, `${ekrandakiVeri.sure_no}. ${sureAdi} Suresi`);
      }

      // 2. YENİ: İlerleme Çubuğu Mantığı (Zıplamayı Önler!)
      // Ekranda görünen EN ALTTAKİ ayete bakar. Örneğin 286 ayetlik surede ekranda 14. ayet varsa %5 civarı çizer.
      if (toplamAyetRef.current > 0) {
        const sonGorunenAyet = viewableItems[viewableItems.length - 1].item;
        if (sonGorunenAyet) {
          const yuzde = (sonGorunenAyet.ayet_no / toplamAyetRef.current) * 100;
          
          // Çizgiyi anında koparmak yerine bir sıvı gibi akıtır (duration: 300ms)
          Animated.timing(progressAnim, {
            toValue: yuzde,
            duration: 300,
            useNativeDriver: false // Genişlik animasyonlarında false olmalıdır
          }).start();
        }
      }
    }
  }).current;

  const viewabilityConfig = useRef({ 
    itemVisiblePercentThreshold: 10,
    minimumViewTime: 250 
  }).current;

  useEffect(() => {
    if (sureId) verileriGetir();
  }, [sureId, hedefAyet, seciliYazarlar]);

  const verileriGetir = () => {
    if (!sureId) return;

    setYukleniyor(true);
    progressAnim.setValue(0); // YENİ: Sure değiştiğinde çizgiyi en başa (sıfıra) çeker
    
    try {
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
        const sql = `SELECT * FROM Mealler WHERE sure_no = ? AND yazar_adi IN (${placeholders}) ORDER BY yazar_adi ASC`;
        const queryParams = [queryId, ...temizYazarlar];
        meallerResult = db.getAllSync(sql, queryParams);
      }

      const birlestirilmisVeri = ayetlerResult.map(ayet => ({
        ...ayet,
        kelimeler: kelimelerResult.filter(k => k.ayet_no === ayet.ayet_no),
        mealler: meallerResult.filter(m => m.ayet_no === ayet.ayet_no)
      }));

      // YENİ: Surenin toplam ayet sayısını referansa kaydediyoruz
      toplamAyetRef.current = birlestirilmisVeri.length;

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
        setSonOkunan(queryId, hAyetNo, `${queryId}. ${SURE_ADLARI[queryId]} Suresi`);
      } 
    } catch (error) {
      console.warn("Veri çekme sırasında hata:", error);
      setYukleniyor(false);
    }
  };

  const themeBg = karanlikMod ? '#121212' : '#f5f6fa';
  const cardBg = karanlikMod ? '#1E1E1E' : 'white';
  const textColor = karanlikMod ? '#E0E0E0' : '#222';
  const subTextColor = karanlikMod ? '#A0A0A0' : '#555';
  const borderColor = karanlikMod ? '#333' : '#eee';
  const wordBg = karanlikMod ? '#2C2C2C' : '#fff';
  const wordContainerBg = karanlikMod ? '#1A1A1A' : '#f9f9f9';

  const renderAyet = ({ item }) => (
    <View style={[styles.ayetKutusu, { backgroundColor: cardBg }]}>
      <View style={[styles.ustKisim, { borderBottomColor: borderColor }]}>
        <Text style={styles.ayetNoBadge}>{item.ayet_no}</Text>
        {arapcaGoster && (
          <>
            <Text style={[styles.arapcaMetin, { fontSize: yaziBoyutu + 8, color: textColor }]}>{item.arapca}</Text>
            <Text style={[styles.okunusMetin, { fontSize: yaziBoyutu, color: subTextColor }]}>{item.okunus}</Text>
          </>
        )}
      </View>

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

  // SONRAKİ SURE HESAPLAMA MANTIĞI
  let sonrakiSureId = null;
  if (sNo > 0 && sNo <= 114) {
    if (inisSirasinaGore) {
      const mevcutIndex = NUZUL_SIRASI.indexOf(sNo);
      if (mevcutIndex !== -1 && mevcutIndex < NUZUL_SIRASI.length - 1) {
        sonrakiSureId = NUZUL_SIRASI[mevcutIndex + 1];
      }
    } else {
      if (sNo < 114) {
        sonrakiSureId = sNo + 1;
      }
    }
  }

  // LİSTE SONU BUTONU (FOOTER)
  const renderFooter = () => {
    if (!sonrakiSureId) return <View style={{ height: 40 }} />; 
    
    const sonrakiSureAdi = SURE_ADLARI[sonrakiSureId];
    const detayMetni = inisSirasinaGore 
      ? `İniş: ${NUZUL_SIRASI.indexOf(sonrakiSureId) + 1}. Sure`
      : `Mushaf: ${sonrakiSureId}. Sure`;

    return (
      <View style={{ marginTop: 10, marginBottom: 40, alignItems: 'stretch' }}>
        <TouchableOpacity
          onPress={() => router.replace(`/oku/${sonrakiSureId}`)}
          style={{
            backgroundColor: karanlikMod ? '#1E2B1E' : '#E8F5E9',
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: karanlikMod ? '#2E4C2E' : '#C8E6C9',
          }}
        >
          <View style={{ flex: 1, marginRight: 15 }}>
            <Text style={{ fontSize: 13, color: karanlikMod ? '#A5D6A7' : '#388E3C', marginBottom: 4 }}>Sonraki Sure'ye Geç</Text>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: karanlikMod ? '#E8F5E9' : '#1B5E20' }}>{sonrakiSureAdi}</Text>
            <Text style={{ fontSize: 12, fontStyle: 'italic', color: karanlikMod ? '#81C784' : '#4CAF50', marginTop: 2 }}>{detayMetni}</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={38} color={karanlikMod ? '#A5D6A7' : '#4CAF50'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeBg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.ustAyarlar, { 
        backgroundColor: cardBg, 
        borderBottomWidth: 0, 
        paddingTop: insets.top + 10
      }]}>
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

        <View style={styles.fontAyarKutusu}>
          <TouchableOpacity onPress={() => setYaziBoyutu(Math.max(12, yaziBoyutu - 2))} style={[styles.fontButon, { backgroundColor: karanlikMod ? '#2A3B2A' : '#E8F5E9' }]}>
            <Text style={styles.fontButonYazi}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setYaziBoyutu(Math.min(30, yaziBoyutu + 2))} style={[styles.fontButon, { backgroundColor: karanlikMod ? '#2A3B2A' : '#E8F5E9' }]}>
            <Text style={styles.fontButonYazi}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* YENİ: ZEKİ VE AKICI OKUMA İLERLEME ÇUBUĞU (Animasyonlu) */}
      <View style={{ height: 3, width: '100%', backgroundColor: karanlikMod ? '#2A3B2A' : '#E8F5E9' }}>
        <Animated.View style={{ 
          height: '100%', 
          backgroundColor: '#4CAF50',
          width: progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%']
          }) 
        }} />
      </View>
      
      <FlatList
        ref={flatListRef}
        data={ayetler}
        keyExtractor={(item) => item.ayet_no.toString()}
        renderItem={renderAyet}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ padding: 15 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        // onScroll ve scrollEventThrottle buradan KESİNLİKLE SİLİNDİ! Zıplamaya yer yok.
        onScrollToIndexFailed={info => {
          const offset = (info.averageItemLength || 500) * info.index;
          flatListRef.current?.scrollToOffset({ offset, animated: false });
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: false, viewPosition: 0 });
          }, 200);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  merkez: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ustAyarlar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
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