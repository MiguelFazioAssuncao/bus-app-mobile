import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = { bg: '#363636', text: '#E5E5E5', mute: '#9C9A9A', card: '#2D2B2B' };

export default function Stations() {
  const mapRef = useRef(null);
  const [point1, setPoint1] = useState('-23.55052,-46.633308');
  const [point2, setPoint2] = useState('-23.589,-46.658');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [endpoints, setEndpoints] = useState({ start: null, end: null });

  const API_BASE = Platform.select({ ios: 'http://localhost:3000', android: 'http://10.0.2.2:3000', default: 'http://localhost:3000' });
  const getToken = async () => await AsyncStorage.getItem('token');

  const handleRoute = async () => {
    try {
      setLoading(true);
      setError('');
      setSummary(null);
      setRouteCoords([]);
      const p1 = point1.replace(/\s+/g, '');
      const p2 = point2.replace(/\s+/g, '');
      const token = await getToken();
      const res = await fetch(`${API_BASE}/stations/route?point1=${encodeURIComponent(p1)}&point2=${encodeURIComponent(p2)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const path = data?.paths?.[0];
      if (!path) throw new Error('Rota não encontrada');
      let coords = [];
      if (data?.info?.points_encoded === true || path?.points_encoded === true || typeof path?.points === 'string') {
        const encoded = typeof path.points === 'string' ? path.points : (data?.paths?.[0]?.points);
        coords = decodePolyline(encoded, 5).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
      } else if (path?.points?.coordinates) {
        coords = path.points.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
      }
      if (!coords.length) throw new Error('Falha ao decodificar linhas da rota');
      const start = p1.split(',').map(Number);
      const end = p2.split(',').map(Number);
      setEndpoints({ start: { latitude: start[0], longitude: start[1] }, end: { latitude: end[0], longitude: end[1] } });
      setRouteCoords(coords);
      setSummary({ distanceKm: (path.distance / 1000).toFixed(2), timeMin: Math.round(path.time / 60000) });
    } catch (e) {
      setError(e.message || 'Erro ao buscar rota');
    } finally {
      setLoading(false);
    }
  };

  const decodePolyline = (str, precision = 5) => {
    let index = 0, lat = 0, lng = 0, coordinates = [];
    const factor = Math.pow(10, precision);
    while (index < str.length) {
      let b, shift = 0, result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0; result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      coordinates.push([lat / factor, lng / factor]);
    }
    return coordinates;
  };

  useEffect(() => {
    if (!mapRef.current || routeCoords.length === 0) return;
    setTimeout(() => {
      try { mapRef.current.fitToCoordinates(routeCoords, { edgePadding: { top: 40, right: 40, bottom: 40, left: 40 }, animated: true }); } catch {}
    }, 50);
  }, [routeCoords]);

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
          <MapView ref={mapRef} style={styles.map} initialRegion={{ latitude: -23.55, longitude: -46.63, latitudeDelta: 0.1, longitudeDelta: 0.1 }}>
            {endpoints.start && <Marker coordinate={endpoints.start} title="Início" />}
            {endpoints.end && <Marker coordinate={endpoints.end} title="Fim" />}
            {routeCoords.length > 0 && (<Polyline coordinates={routeCoords} strokeColor="#FFA652" strokeWidth={4} />)}
          </MapView>
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
});
