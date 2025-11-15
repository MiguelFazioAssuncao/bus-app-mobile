import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = { bg: '#363636', card: '#2D2B2B', text: '#E5E5E5', mute: '#9C9A9A', primary: '#FFA652' };

export default function Search() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSubtitle, setModalSubtitle] = useState('');
  const [loading, setLoading] = useState(false);

  const getStorage = async (key, def = null) => {
    try {
      if (Platform.OS === 'web') return JSON.parse(window.localStorage.getItem(key) || 'null') ?? def;
      const v = await AsyncStorage.getItem(key);
      return v ? JSON.parse(v) : def;
    } catch { return def; }
  };
  const setStorage = async (key, val) => {
    try {
      const str = JSON.stringify(val);
      if (Platform.OS === 'web') window.localStorage.setItem(key, str);
      else await AsyncStorage.setItem(key, str);
    } catch {}
  };

  const userId = useMemo(() => {
    try {
      if (Platform.OS === 'web') {
        const u = JSON.parse(window.localStorage.getItem('user') || 'null');
        return u?.id || 'anon';
      }
      return 'anon';
    } catch { return 'anon'; }
  }, []);

  useEffect(() => {
    (async () => {
      const f = await getStorage(`favorites_${userId}`, []);
      const r = await getStorage(`recents_${userId}`, []);
      if (Array.isArray(f)) setFavorites(f);
      if (Array.isArray(r)) setRecents(r);
    })();
  }, [userId]);

  useEffect(() => { setStorage(`favorites_${userId}`, favorites); }, [favorites, userId]);
  useEffect(() => { setStorage(`recents_${userId}`, recents); }, [recents, userId]);

  const toggleFavoriteFromRecents = (item) => {
    const exists = favorites.some((f) => f.title === item.title);
    if (!exists) setFavorites([{ id: `fav-${Date.now()}`, title: item.title, subtitle: item.subtitle || '' }, ...favorites]);
    setRecents(recents.map((r) => (r.id === item.id ? { ...r, favorite: !r.favorite } : r)));
  };

  const toggleFavoriteFromFavorites = (item) => {
    setFavorites(favorites.filter((f) => f.id !== item.id));
    const exists = recents.some((r) => r.title === item.title);
    if (!exists) setRecents([{ id: `r-${Date.now()}`, title: item.title, subtitle: item.subtitle || '', favorite: false }, ...recents]);
  };

  const openAddModal = (prefill = '') => {
    setModalTitle(prefill);
    setModalSubtitle('');
    setModalOpen(true);
  };

  const saveChosenLocation = async () => {
    if (!modalTitle.trim()) return;
    const newRecent = { id: `r-${Date.now()}`, title: modalTitle.trim(), subtitle: modalSubtitle.trim(), favorite: false };
    setRecents([newRecent, ...recents]);
    if (modalTitle.trim().toLowerCase() === 'home') {
      const existing = (await getStorage('homeInfo')) || { name: 'Home' };
      await setStorage('homeInfo', { ...existing, name: 'Home' });
    }
    setModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
            <FontAwesome5 name="chevron-left" size={22} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.input}
              placeholder="Where do you want to go?"
              placeholderTextColor={COLORS.mute}
              value={query}
              onChangeText={setQuery}
            />
            <View style={styles.searchBtn}>
              <FontAwesome5 name="search" size={16} color="#D1D5DB" />
            </View>
          </View>
        </View>

        <View style={styles.links}>
          <TouchableOpacity style={styles.rowLink} onPress={() => navigation.navigate('Lines')}>
            <FontAwesome5 name="route" size={20} color="#3B82F6" />
            <Text style={[styles.linkText, { color: '#3B82F6' }]}>Search for a line</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.rowLink} onPress={() => navigation.navigate('Stations')}>
            <FontAwesome5 name="map" size={20} color="#3B82F6" />
            <Text style={[styles.linkText, { color: '#3B82F6' }]}>Choose on map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rowLink} onPress={() => openAddModal('')}>
            <FontAwesome5 name="map-marker-alt" size={20} color="#3B82F6" />
            <Text style={[styles.linkText, { color: '#3B82F6' }]}>Add location</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Favorites</Text>
        {favorites.map((f) => (
          <View key={f.id} style={styles.card}>
            <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Directions')}>
              <FontAwesome5 name="map-marker-alt" size={20} color="#D1D5DB" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                {!!f.subtitle && <Text style={styles.cardSub}>{f.subtitle}</Text>}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavoriteFromFavorites(f)}>
              <FontAwesome5 name="star" solid size={18} color="#FBBF24" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Recent</Text>
        <View style={{ gap: 8 }}>
          {recents.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardRow}>
                <FontAwesome5 name="clock" size={18} color="#D1D5DB" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{r.title}</Text>
                  {!!r.subtitle && <Text style={styles.cardSub}>{r.subtitle}</Text>}
                </View>
              </View>
              <TouchableOpacity onPress={() => toggleFavoriteFromRecents(r)}>
                <FontAwesome5 name={r.favorite ? 'star' : 'star'} solid={!!r.favorite} size={18} color={r.favorite ? '#FBBF24' : '#D1D5DB'} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={styles.muted}>Didn’t find what you’re looking for?</Text>
          <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Stations')}>
            <Text style={styles.ctaText}>Find on map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add location</Text>
            <View style={{ gap: 12 }}>
              <View>
                <Text style={styles.label}>Name</Text>
                <TextInput value={modalTitle} onChangeText={setModalTitle} placeholder="Ex.: home" placeholderTextColor={COLORS.mute} style={styles.input} />
              </View>
              <View>
                <Text style={styles.label}>Address (optional)</Text>
                <TextInput value={modalSubtitle} onChangeText={setModalSubtitle} placeholder="Rua ..." placeholderTextColor={COLORS.mute} style={styles.input} />
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.btnGrey]} onPress={() => setModalOpen(false)}>
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnPrimary, loading && { opacity: 0.7 }]} onPress={saveChosenLocation} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 16, paddingVertical: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  searchWrap: { flex: 1, position: 'relative', justifyContent: 'center' },
  input: { backgroundColor: COLORS.card, color: COLORS.text, borderRadius: 8, paddingVertical: 10, paddingLeft: 14, paddingRight: 40 },
  searchBtn: { position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center' },
  links: { gap: 6, marginBottom: 10 },
  rowLink: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  linkText: { fontSize: 15 },
  divider: { height: 1, backgroundColor: '#4B5563', marginVertical: 8 },
  sectionTitle: { color: COLORS.mute, fontSize: 13, marginTop: 8, marginBottom: 6 },
  card: { backgroundColor: COLORS.card, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  cardSub: { color: COLORS.mute, fontSize: 12 },
  muted: { color: COLORS.mute, fontSize: 13, marginBottom: 8 },
  cta: { borderWidth: 1, borderColor: '#3B82F6', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  ctaText: { color: '#3B82F6', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 520, backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  label: { color: COLORS.mute, fontSize: 12, marginBottom: 6 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnGrey: { backgroundColor: '#374151' },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnText: { color: '#fff', fontWeight: '600' },
});
