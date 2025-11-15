import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, ActivityIndicator, Platform } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
  bg: '#363636',
  card: '#2D2B2B',
  text: '#E5E5E5',
  mute: '#9C9A9A',
  input: '#262424',
  primary: '#FFA652',
};

export default function Directions() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [name, setName] = useState('');
  const [point1, setPoint1] = useState('');
  const [point2, setPoint2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [homeInfo, setHomeInfo] = useState({ name: 'Home', time: '26 min', distance: '2.4km' });
  const [workInfo, setWorkInfo] = useState({ name: 'Work', time: null, distance: null });

  const API_BASE = Platform.select({ web: 'http://localhost:3000', ios: 'http://localhost:3000', android: 'http://10.0.2.2:3000', default: 'http://localhost:3000' });

  const readStorage = async (key) => {
    if (Platform.OS === 'web') {
      try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
    }
    const v = await AsyncStorage.getItem(key);
    try { return v ? JSON.parse(v) : null; } catch { return null; }
  };

  const getToken = async () => {
    if (Platform.OS === 'web') return window.localStorage.getItem('token');
    return await AsyncStorage.getItem('token');
  };
  const writeStorage = async (key, value) => {
    const str = JSON.stringify(value);
    if (Platform.OS === 'web') return localStorage.setItem(key, str);
    return AsyncStorage.setItem(key, str);
  };

  useEffect(() => {
    (async () => {
      const h = await readStorage('homeInfo');
      const w = await readStorage('workInfo');
      if (h && h.name) setHomeInfo(h);
      if (w && w.name) setWorkInfo(w);

      const user = await readStorage('user');
      const userId = user?.id;
      if (!userId) return;
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/directions/preferences?userId=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.home) {
          const next = {
            name: data.home.name || 'Home',
            time: data.home.time || (data.home.timeMinutes ? `${data.home.timeMinutes} min` : null) || '26 min',
            distance: data.home.distance || (data.home.distanceMeters ? `${(data.home.distanceMeters/1000).toFixed(2)} km` : null) || '2.4km',
          };
          setHomeInfo(next);
          await writeStorage('homeInfo', next);
        }
        if (data?.work) {
          const next = {
            name: data.work.name || 'Work',
            time: data.work.time || (data.work.timeMinutes ? `${data.work.timeMinutes} min` : null),
            distance: data.work.distance || (data.work.distanceMeters ? `${(data.work.distanceMeters/1000).toFixed(2)} km` : null),
          };
          setWorkInfo(next);
          await writeStorage('workInfo', next);
        }
      } catch {}
    })();
  }, []);

  const openModal = (type) => {
    setModalType(type);
    setName('');
    setPoint1('');
    setPoint2('');
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const submitLocation = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const user = await readStorage('user');
      const userId = user?.id;
      if (!userId) {
        setError('Usuário não identificado. Faça login novamente.');
        return;
      }

      const url = modalType === 'home' ? `${API_BASE}/directions/setHome` : `${API_BASE}/directions/setWork`;
      const body = { userId, point1, point2, ...(modalType === 'home' ? { homeName: name } : { workName: name }) };

      const token = await getToken();
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSuccess(data?.message || 'Salvo com sucesso');
      if (modalType === 'home') {
        const h = data?.home || {};
        const next = { name: h.name || name || 'Home', time: h.time || (h.timeMinutes ? `${h.timeMinutes} min` : homeInfo.time), distance: h.distance || (h.distanceMeters ? `${(h.distanceMeters/1000).toFixed(2)} km` : homeInfo.distance) };
        setHomeInfo(next);
        await writeStorage('homeInfo', next);
      } else {
        const w = data?.work || {};
        const next = { name: w.name || name || 'Work', time: w.time || (w.timeMinutes ? `${w.timeMinutes} min` : workInfo.time), distance: w.distance || (w.distanceMeters ? `${(w.distanceMeters/1000).toFixed(2)} km` : workInfo.distance) };
        setWorkInfo(next);
        await writeStorage('workInfo', next);
      }
      setTimeout(() => setModalOpen(false), 400);
    } catch (e) {
      setError(e.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>My frequent destination</Text>
        <View style={styles.divider} />

        <View style={styles.list}>
          <TouchableOpacity style={styles.card} onPress={() => openModal('home')}>
            <View style={styles.cardRow}>
              <FontAwesome5 name="home" size={20} color="#D1D5DB" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{homeInfo.name}</Text>
                <View style={styles.metaRow}>
                  <FontAwesome5 name="walking" size={14} color={COLORS.mute} />
                  <Text style={styles.metaText}>{homeInfo.time}</Text>
                  <Text style={styles.metaText}>{homeInfo.distance}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => openModal('work')}>
            <View style={styles.cardRow}>
              <FontAwesome5 name="briefcase" size={20} color="#D1D5DB" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{workInfo.name}</Text>
                {workInfo.time && workInfo.distance ? (
                  <View style={styles.metaRow}>
                    <FontAwesome5 name="walking" size={14} color={COLORS.mute} />
                    <Text style={styles.metaText}>{workInfo.time}</Text>
                    <Text style={styles.metaText}>{workInfo.distance}</Text>
                  </View>
                ) : (
                  <Text style={styles.metaText}>Tap to set</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modalType === 'home' ? 'Set Home' : 'Set Work'}</Text>

            <View style={styles.modalGroup}>
              <Text style={styles.modalLabel}>{modalType === 'home' ? 'Home name' : 'Work name'}</Text>
              <TextInput value={name} onChangeText={setName} placeholder={modalType === 'home' ? 'Home' : 'Work'} placeholderTextColor={COLORS.mute} style={styles.input} />
            </View>
            <View style={styles.modalGroup}>
              <Text style={styles.modalLabel}>Point 1 (lat,lng)</Text>
              <TextInput value={point1} onChangeText={setPoint1} placeholder="-23.55,-46.63" placeholderTextColor={COLORS.mute} style={styles.input} />
            </View>
            <View style={styles.modalGroup}>
              <Text style={styles.modalLabel}>Point 2 (lat,lng)</Text>
              <TextInput value={point2} onChangeText={setPoint2} placeholder="-23.56,-46.64" placeholderTextColor={COLORS.mute} style={styles.input} />
            </View>

            {!!error && <Text style={[styles.feedback, { color: '#f87171' }]}>{error}</Text>}
            {!!success && <Text style={[styles.feedback, { color: '#34d399' }]}>{success}</Text>}

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.btnGrey]} onPress={closeModal} disabled={loading}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary, loading && { opacity: 0.7 }]} onPress={submitLocation} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 64 }} />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 24, paddingVertical: 16 },
  sectionTitle: { color: '#E5E5E5', fontSize: 14, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#4B5563', marginBottom: 16 },
  list: { gap: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 8, padding: 16 },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cardTitle: { color: COLORS.text, fontSize: 16, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaText: { color: COLORS.mute, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  modalCard: { width: '100%', maxWidth: 520, backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  modalGroup: { marginBottom: 12 },
  modalLabel: { color: COLORS.mute, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: COLORS.input, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text },
  feedback: { textAlign: 'left', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnGrey: { backgroundColor: '#374151' },
  btnPrimary: { backgroundColor: '#FFA652' },
  btnText: { color: '#fff', fontWeight: '600' },
});

