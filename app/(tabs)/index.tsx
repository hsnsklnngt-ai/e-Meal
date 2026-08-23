// @ts-nocheck
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStore } from '../../store';

const TUM_SURELER = [
  { id: 1, ad: 'Fatiha', ayet: 7 }, { id: 2, ad: 'Bakara', ayet: 286 }, { id: 3, ad: 'Âl-i İmrân', ayet: 200 }, { id: 4, ad: 'Nisâ', ayet: 176 }, { id: 5, ad: 'Mâide', ayet: 120 }, { id: 6, ad: 'En\'âm', ayet: 165 }, { id: 7, ad: 'A\'râf', ayet: 206 }, { id: 8, ad: 'Enfâl', ayet: 75 }, { id: 9, ad: 'Tevbe', ayet: 129 }, { id: 10, ad: 'Yûnus', ayet: 109 },
  { id: 11, ad: 'Hûd', ayet: 123 }, { id: 12, ad: 'Yûsuf', ayet: 111 }, { id: 13, ad: 'Ra\'d', ayet: 43 }, { id: 14, ad: 'İbrâhîm', ayet: 52 }, { id: 15, ad: 'Hicr', ayet: 99 }, { id: 16, ad: 'Nahl', ayet: 128 }, { id: 17, ad: 'İsrâ', ayet: 111 }, { id: 18, ad: 'Kehf', ayet: 110 }, { id: 19, ad: 'Meryem', ayet: 98 }, { id: 20, ad: 'Tâhâ', ayet: 135 },
  { id: 21, ad: 'Enbiyâ', ayet: 112 }, { id: 22, ad: 'Hac', ayet: 78 }, { id: 23, ad: 'Mü\'minûn', ayet: 118 }, { id: 24, ad: 'Nûr', ayet: 64 }, { id: 25, ad: 'Furkân', ayet: 77 }, { id: 26, ad: 'Şuarâ', ayet: 227 }, { id: 27, ad: 'Neml', ayet: 93 }, { id: 28, ad: 'Kasas', ayet: 88 }, { id: 29, ad: 'Ankebût', ayet: 69 }, { id: 30, ad: 'Rûm', ayet: 60 },
  { id: 31, ad: 'Lokmân', ayet: 34 }, { id: 32, ad: 'Secde', ayet: 30 }, { id: 33, ad: 'Ahzâb', ayet: 73 }, { id: 34, ad: 'Sebe\'', ayet: 54 }, { id: 35, ad: 'Fâtır', ayet: 45 }, { id: 36, ad: 'Yâsîn', ayet: 83 }, { id: 37, ad: 'Sâffât', ayet: 182 }, { id: 38, ad: 'Sâd', ayet: 88 }, { id: 39, ad: 'Zümer', ayet: 75 }, { id: 40, ad: 'Mü\'min', ayet: 85 },
  { id: 41, ad: 'Fussilet', ayet: 54 }, { id: 42, ad: 'Şûrâ', ayet: 53 }, { id: 43, ad: 'Zuhruf', ayet: 89 }, { id: 44, ad: 'Duhân', ayet: 59 }, { id: 45, ad: 'Câsiye', ayet: 37 }, { id: 46, ad: 'Ahkâf', ayet: 35 }, { id: 47, ad: 'Muhammed', ayet: 38 }, { id: 48, ad: 'Fetih', ayet: 29 }, { id: 49, ad: 'Hucurât', ayet: 18 }, { id: 50, ad: 'Kâf', ayet: 45 },
  { id: 51, ad: 'Zâriyât', ayet: 60 }, { id: 52, ad: 'Tûr', ayet: 49 }, { id: 53, ad: 'Necm', ayet: 62 }, { id: 54, ad: 'Kamer', ayet: 55 }, { id: 55, ad: 'Rahmân', ayet: 78 }, { id: 56, ad: 'Vâkıa', ayet: 96 }, { id: 57, ad: 'Hadîd', ayet: 29 }, { id: 58, ad: 'Mücâdele', ayet: 22 }, { id: 59, ad: 'Haşr', ayet: 24 }, { id: 60, ad: 'Mümtehine', ayet: 13 },
  { id: 61, ad: 'Saf', ayet: 14 }, { id: 62, ad: 'Cuma', ayet: 11 }, { id: 63, ad: 'Münâfikûn', ayet: 11 }, { id: 64, ad: 'Teğâbün', ayet: 18 }, { id: 65, ad: 'Talâk', ayet: 12 }, { id: 66, ad: 'Tahrîm', ayet: 12 }, { id: 67, ad: 'Mülk', ayet: 30 }, { id: 68, ad: 'Kalem', ayet: 52 }, { id: 69, ad: 'Hâkka', ayet: 52 }, { id: 70, ad: 'Meâric', ayet: 44 },
  { id: 71, ad: 'Nûh', ayet: 28 }, { id: 72, ad: 'Cin', ayet: 28 }, { id: 73, ad: 'Müzzemmil', ayet: 20 }, { id: 74, ad: 'Müddessir', ayet: 56 }, { id: 75, ad: 'Kıyâme', ayet: 40 }, { id: 76, ad: 'İnsân', ayet: 31 }, { id: 77, ad: 'Mürselât', ayet: 50 }, { id: 78, ad: 'Nebe\'', ayet: 40 }, { id: 79, ad: 'Nâziât', ayet: 46 }, { id: 80, ad: 'Abese', ayet: 42 },
  { id: 81, ad: 'Tekvîr', ayet: 29 }, { id: 82, ad: 'İnfitâr', ayet: 19 }, { id: 83, ad: 'Mutaffifîn', ayet: 36 }, { id: 84, ad: 'İnşikâk', ayet: 25 }, { id: 85, ad: 'Bürûc', ayet: 22 }, { id: 86, ad: 'Târık', ayet: 17 }, { id: 87, ad: 'A\'lâ', ayet: 19 }, { id: 88, ad: 'Gâşiye', ayet: 26 }, { id: 89, ad: 'Fecr', ayet: 30 }, { id: 90, ad: 'Beled', ayet: 20 },
  { id: 91, ad: 'Şems', ayet: 15 }, { id: 92, ad: 'Leyl', ayet: 21 }, { id: 93, ad: 'Duhâ', ayet: 11 }, { id: 94, ad: 'İnşirâh', ayet: 8 }, { id: 95, ad: 'Tîn', ayet: 8 }, { id: 96, ad: 'Alak', ayet: 19 }, { id: 97, ad: 'Kadr', ayet: 5 }, { id: 98, ad: 'Beyyine', ayet: 8 }, { id: 99, ad: 'Zilzâl', ayet: 8 }, { id: 100, ad: 'Âdiyât', ayet: 11 },
  { id: 101, ad: 'Kâria', ayet: 11 }, { id: 102, ad: 'Tekâsür', ayet: 8 }, { id: 103, ad: 'Asr', ayet: 3 }, { id: 104, ad: 'Hümeze', ayet: 9 }, { id: 105, ad: 'Fîl', ayet: 5 }, { id: 106, ad: 'Kureyş', ayet: 4 }, { id: 107, ad: 'Mâûn', ayet: 7 }, { id: 108, ad: 'Kevser', ayet: 3 }, { id: 109, ad: 'Kâfirûn', ayet: 6 }, { id: 110, ad: 'Nasr', ayet: 3 },
  { id: 111, ad: 'Tebbet', ayet: 5 }, { id: 112, ad: 'İhlâs', ayet: 4 }, { id: 113, ad: 'Felak', ayet: 5 }, { id: 114, ad: 'Nâs', ayet: 6 }
];

export default function IndexScreen() {
  const router = useRouter();
  const { sonOkunan, karanlikMod } = useStore(); // Karanlık Mod Eklendi
  
  const [hizliSureMetni, setHizliSureMetni] = useState('');
  const [hizliSureId, setHizliSureId] = useState(null); 
  const [hizliDropdownAcik, setHizliDropdownAcik] = useState(false);
  const [aramaAyet, setAramaAyet] = useState('');
  const [sureAramaMetni, setSureAramaMetni] = useState('');

  const hizliOneriler = TUM_SURELER.filter(sure => 
    sure.ad.toLocaleLowerCase('tr-TR').startsWith(hizliSureMetni.toLocaleLowerCase('tr-TR'))
  );

  const filtrelenmisSureler = TUM_SURELER.filter(sure => 
    sure.ad.toLocaleLowerCase('tr-TR').startsWith(sureAramaMetni.toLocaleLowerCase('tr-TR'))
  );

  const hizliGit = () => {
    let hedefSureId = hizliSureId;
    if (!hedefSureId) {
       const exactMatch = TUM_SURELER.find(s => s.ad.toLocaleLowerCase('tr-TR') === hizliSureMetni.toLocaleLowerCase('tr-TR'));
       if (exactMatch) hedefSureId = exactMatch.id;
    }

    if (hedefSureId) {
      router.push(`/oku/${hedefSureId}?hedefAyet=${aramaAyet || 1}`);
      setHizliSureMetni('');
      setHizliSureId(null);
      setAramaAyet('');
    } else {
      alert("Lütfen geçerli bir sure adı girin veya listeden seçin.");
    }
  };

  // Dinamik Temalar
  const themeBg = karanlikMod ? '#121212' : '#f5f6fa';
  const cardBg = karanlikMod ? '#1E1E1E' : 'white';
  const textColor = karanlikMod ? '#E0E0E0' : '#333';
  const subTextColor = karanlikMod ? '#A0A0A0' : '#666';
  const inputBg = karanlikMod ? '#2C2C2C' : '#fafafa';
  const borderColor = karanlikMod ? '#333' : '#ddd';

  return (
    <View style={[styles.container, { backgroundColor: themeBg }]}>
      
      {/* 1. SON OKUNAN BÖLÜMÜ */}
      {sonOkunan && (
        <TouchableOpacity 
          style={[styles.sonOkunanKutusu, karanlikMod && { backgroundColor: '#2A3B2A' }]}
          onPress={() => router.push(`/oku/${sonOkunan.sure}?hedefAyet=${sonOkunan.ayet}`)}
        >
          <Text style={[styles.sonOkunanBaslik, karanlikMod && { color: '#81C784' }]}>Kaldığın Yerden Devam Et</Text>
          <Text style={[styles.sonOkunanYazi, karanlikMod && { color: '#E8F5E9' }]}>{sonOkunan.sureAd} - {sonOkunan.ayet}. Ayet</Text>
        </TouchableOpacity>
      )}

      {/* 2. HIZLI ARAMA BÖLÜMÜ */}
      <View style={[styles.aramaKutusu, { backgroundColor: cardBg, zIndex: 10 }]}>
        <Text style={[styles.baslik, { color: subTextColor }]}>Ayet Numarasına Git</Text>
        <View style={styles.aramaSatiri}>
          
          <View style={{ flex: 1.2, marginRight: 10, position: 'relative', zIndex: 100 }}>
            <TextInput 
              style={[styles.input, { backgroundColor: inputBg, borderColor: borderColor, color: textColor }]} 
              placeholder="Sure Adı (Ör: Fatiha)" 
              placeholderTextColor={subTextColor}
              value={hizliSureMetni} 
              onChangeText={(text) => {
                setHizliSureMetni(text);
                setHizliSureId(null);
                setHizliDropdownAcik(true);
              }} 
            />
            
            {hizliDropdownAcik && hizliSureMetni.length > 0 && (
                <View style={[styles.dropdownKutusu, { backgroundColor: cardBg, borderColor: borderColor }]}>
                   {hizliOneriler.slice(0, 4).map(sure => (
                       <TouchableOpacity 
                          key={sure.id} 
                          style={[styles.dropdownItem, { borderBottomColor: borderColor }]}
                          onPress={() => {
                              setHizliSureMetni(sure.ad);
                              setHizliSureId(sure.id);
                              setHizliDropdownAcik(false);
                          }}>
                           <Text style={[styles.dropdownItemText, { color: textColor }]}>{sure.ad}</Text>
                       </TouchableOpacity>
                   ))}
                   {hizliOneriler.length === 0 && (
                       <Text style={[styles.dropdownYokText, { color: subTextColor }]}>Eşleşen sure yok</Text>
                   )}
                </View>
            )}
          </View>

          <TextInput 
            style={[styles.input, { flex: 0.6, marginRight: 10, backgroundColor: inputBg, borderColor: borderColor, color: textColor }]} 
            placeholder="Ayet No" 
            placeholderTextColor={subTextColor}
            keyboardType="number-pad" 
            value={aramaAyet} 
            onChangeText={setAramaAyet} 
          />
          <TouchableOpacity style={styles.gitButon} onPress={hizliGit}>
            <Text style={styles.gitButonYazi}>Git</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. SURE LİSTESİ VE İSİM FİLTRESİ */}
      <View style={[styles.listeUstKisim, { zIndex: 1 }]}>
        <Text style={[styles.baslik, { color: subTextColor }]}>Sure Listesi</Text>
        <TextInput 
          style={[styles.isimAramaInput, { backgroundColor: cardBg, borderColor: borderColor, color: textColor }]} 
          placeholder="Sure Ara (Örn: Yasin)" 
          placeholderTextColor={subTextColor}
          value={sureAramaMetni}
          onChangeText={setSureAramaMetni}
        />
      </View>
      
      <FlatList
        data={filtrelenmisSureler}
        keyExtractor={(item) => item.id.toString()}
        keyboardShouldPersistTaps="handled" 
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.sureKart, { backgroundColor: cardBg }]}
            onPress={() => router.push(`/oku/${item.id}`)}
          >
            <View style={[styles.sureNoYuvarlak, karanlikMod && { backgroundColor: '#2A3B2A' }]}>
              <Text style={styles.sureNoYazi}>{item.id}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.sureAdi, { color: textColor }]}>{item.ad} Suresi</Text>
            </View>
            <View style={[styles.ayetSayisiKutusu, karanlikMod && { backgroundColor: '#2C2C2C' }]}>
                <Text style={[styles.ayetSayisiYazi, { color: subTextColor }]}>{item.ayet} Ayet</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  sonOkunanKutusu: { backgroundColor: '#388E3C', margin: 15, padding: 15, borderRadius: 10, elevation: 3 },
  sonOkunanBaslik: { color: '#C8E6C9', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  sonOkunanYazi: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  aramaKutusu: { backgroundColor: 'white', margin: 15, marginTop: 0, padding: 15, borderRadius: 10, elevation: 2 },
  baslik: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  aramaSatiri: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 8, backgroundColor: '#fafafa', color: '#333' },
  gitButon: { backgroundColor: '#4CAF50', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 5 },
  gitButonYazi: { color: 'white', fontWeight: 'bold' },
  dropdownKutusu: { position: 'absolute', top: 45, left: 0, right: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#eee', borderRadius: 5, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  dropdownItemText: { fontSize: 14, color: '#333' },
  dropdownYokText: { padding: 10, fontSize: 12, color: '#999', fontStyle: 'italic' },
  listeUstKisim: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 15, marginBottom: 10 },
  isimAramaInput: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, width: '55%', fontSize: 14, borderWidth: 1, borderColor: '#4CAF50', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  sureKart: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, marginHorizontal: 15, marginBottom: 10, borderRadius: 8, elevation: 1 },
  sureNoYuvarlak: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  sureNoYazi: { color: '#4CAF50', fontWeight: 'bold' },
  sureAdi: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  ayetSayisiKutusu: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  ayetSayisiYazi: { fontSize: 12, color: '#888' }
});