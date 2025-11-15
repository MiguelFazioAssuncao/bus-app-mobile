import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Footer from '../components/Footer';

const COLORS = {
  bg: '#363636',
  text: '#E5E5E5',
  mute: '#9C9A9A',
  card: '#2D2B2B',
};

export default function Lines() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const API_BASE = Platform.select({ web: 'http://localhost:3000', ios: 'http://localhost:3000', android: 'http://10.0.2.2:3000', default: 'http://localhost:3000' });

  const getToken = async () => {
    if (Platform.OS === 'web') return window.localStorage.getItem('token');
    return await AsyncStorage.getItem('token');
  };

  const formatTa = (ta) => {
    if (!ta) return '—';
    const d = new Date(ta);
    if (isNaN(d.getTime())) return String(ta);
    return d.toLocaleString();
  };

  useEffect(() => {
    const ctrl = new AbortController();
    const fetchPositions = async () => {
      try {
        setLoading(true);
        setError('');
        const token = await getToken();
        const res = await fetch(`${API_BASE}/lines/positions`, {
          signal: ctrl.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = [];
        if (data && Array.isArray(data.l)) {
          data.l.forEach((line) => {
            const lt0 = line.lt0;
            const lt1 = line.lt1;
            const vehicles = Array.isArray(line.vs) ? line.vs : [];
            vehicles.forEach((v) => {
              list.push({ lt0, lt1, ta: v.ta, vehicle: v.p });
            });
          });
        }
        setItems(list);
        setLastUpdated(new Date());
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Erro ao carregar posições');
      } finally {
        setLoading(false);
      }
    };
    fetchPositions();
    const id = setInterval(fetchPositions, 30000);
    return () => { clearInterval(id); ctrl.abort(); };
  }, [reloadKey]);

  const filtered = useMemo(() => items.filter((it) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      (it.lt0 && it.lt0.toLowerCase().includes(q)) ||
      (it.lt1 && it.lt1.toLowerCase().includes(q)) ||
      (String(it.vehicle || '').toLowerCase().includes(q))
    );
  }), [items, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  const manualRefresh = () => {
    setLoading(true);
    setError('');
    setLastUpdated(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}> 
          <View>
            <Text style={styles.title}>Lines</Text>
            <Text style={styles.subtitle}>Abaixo listamos cada ônibus com seus dados principais.</Text>
          </View>
          <View style={styles.controls}>
            <TextInput
              value={filter}
              onChangeText={(t) => { setFilter(t); setPage(1); }}
              placeholder="Filtrar por origem/destino/veículo"
              placeholderTextColor={COLORS.mute}
              style={styles.input}
            />
            <View style={styles.pageSizeRow}>
              {[5,10,20].map((n) => (
                <TouchableOpacity key={n} style={[styles.psBtn, pageSize===n && styles.psBtnActive]} onPress={() => { setPageSize(n); setPage(1); }}>
                  <Text style={styles.psBtnText}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={manualRefresh} style={styles.refreshBtn} disabled={loading}>
              <Text style={styles.refreshText}>{loading ? 'Atualizando...' : 'Atualizar'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {lastUpdated && (
          <Text style={styles.updated}>Atualizado em {lastUpdated.toLocaleString()}</Text>
        )}

        {loading && <Text style={styles.muted}>Carregando posições...</Text>}
        {!!error && <Text style={styles.error}>{error}</Text>}

        {!loading && !error && (
          <View style={{ gap: 12 }}>
            {paginated.map((it, idx) => (
              <View key={`${it.vehicle || idx}-${idx}`} style={styles.card}>
                <View style={styles.row3}>
                  <View style={styles.col}>
                    <Text style={styles.label}>Destino (lt0)</Text>
                    <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">{it.lt0 || '—'}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>Origem (lt1)</Text>
                    <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">{it.lt1 || '—'}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>Capturado em (ta)</Text>
                    <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">{formatTa(it.ta)}</Text>
                  </View>
                </View>
              </View>
            ))}
            {filtered.length === 0 && (
              <Text style={styles.muted}>Nenhum veículo disponível no momento.</Text>
            )}
            {filtered.length > 0 && (
              <View style={styles.pagerRow}>
                <TouchableOpacity style={styles.pagerBtn} onPress={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                  <Text style={styles.pagerText}>Anterior</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>Página {currentPage} de {totalPages} — {filtered.length} itens</Text>
                <TouchableOpacity style={styles.pagerBtn} onPress={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                  <Text style={styles.pagerText}>Próxima</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <View style={{ height: 64 }} />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 24, paddingVertical: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  subtitle: { color: COLORS.mute, fontSize: 12 },
  controls: { gap: 8, minWidth: 220 },
  input: { backgroundColor: COLORS.card, color: COLORS.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  pageSizeRow: { flexDirection: 'row', gap: 8 },
  psBtn: { backgroundColor: COLORS.card, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  psBtnActive: { backgroundColor: '#3f3f46' },
  psBtnText: { color: COLORS.text, fontSize: 12 },
  refreshBtn: { backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  refreshText: { color: COLORS.text, fontSize: 12 },
  updated: { color: COLORS.mute, fontSize: 11, marginBottom: 8 },
  muted: { color: COLORS.mute, fontSize: 13 },
  error: { color: '#fca5a5', fontSize: 13 },
  card: { backgroundColor: COLORS.card, borderRadius: 8, padding: 16 },
  row3: { flexDirection: 'column', gap: 8 },
  col: { flex: 1, minWidth: 0 },
  label: { color: COLORS.mute, fontSize: 11 },
  value: { color: COLORS.text, fontSize: 14 },
  hr: { height: 1, backgroundColor: '#4B5563', marginTop: 12 },
  pagerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  pagerBtn: { backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  pagerText: { color: COLORS.text, fontSize: 12 },
  pageInfo: { color: COLORS.mute, fontSize: 12 },
});
