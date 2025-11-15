import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';

const COLORS = { bg: '#363636', text: '#E5E5E5', mute: '#9C9A9A', card: '#2D2B2B' };

export default function Stations() {
  const [point1, setPoint1] = useState('-23.55052,-46.633308');
  const [point2, setPoint2] = useState('-23.589,-46.658');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  const API_BASE = 'http://localhost:3000';
  const getToken = () => window.localStorage.getItem('token');

  const handleRoute = async () => {
    try {
      setLoading(true);
      setError('');
      setSummary(null);
      const p1 = point1.replace(/\s+/g, '');
      const p2 = point2.replace(/\s+/g, '');
      const token = getToken();
      const res = await fetch(`${API_BASE}/stations/route?point1=${encodeURIComponent(p1)}&point2=${encodeURIComponent(p2)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const path = data?.paths?.[0];
      if (!path) throw new Error('Rota não encontrada');
      setSummary({ distanceKm: (path.distance / 1000).toFixed(2), timeMin: Math.round(path.time / 60000) });
    } catch (e) {
      setError(e.message || 'Erro ao buscar rota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Stations / Routes</Text>
        <View style={styles.formRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Point 1 (lat,lng)</Text>
            <TextInput value={point1} onChangeText={setPoint1} style={styles.input} placeholder="-23.55052,-46.633308" placeholderTextColor={COLORS.mute} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Point 2 (lat,lng)</Text>
            <TextInput value={point2} onChangeText={setPoint2} style={styles.input} placeholder="-23.589,-46.658" placeholderTextColor={COLORS.mute} />
          </View>
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleRoute} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Traçar rota</Text>}
        </TouchableOpacity>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!summary && (
          <Text style={styles.summary}>Distância: <Text style={{ color: COLORS.text }}>{summary.distanceKm} km</Text> · Tempo: <Text style={{ color: COLORS.text }}>{summary.timeMin} min</Text></Text>
        )}
        <View style={styles.mapWrap}>
          <View style={[styles.map, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={styles.mute}>Mapa indisponível no web neste setup. Use Android/iOS ou peça integração com Google Maps web.</Text>
          </View>
        </View>
      </ScrollView>
      <View style={{ height: 64 }} />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 24, paddingVertical: 16 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginBottom: 8 },
  formRow: { flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  label: { color: COLORS.mute, fontSize: 12, marginBottom: 4 },
  input: { backgroundColor: COLORS.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text },
  btn: { backgroundColor: '#FFA652', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  error: { color: '#fca5a5', marginTop: 6 },
  summary: { color: COLORS.mute, marginBottom: 8 },
  mapWrap: { height: 300, borderRadius: 8, overflow: 'hidden' },
  map: { flex: 1, backgroundColor: COLORS.card },
  mute: { color: COLORS.mute, fontSize: 12, textAlign: 'center' },
});
