import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserProfile() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = Platform.select({ web: 'http://localhost:3000', ios: 'http://localhost:3000', android: 'http://10.0.2.2:3000', default: 'http://localhost:3000' });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        setError('');
        const token = Platform.OS === 'web' ? window.localStorage.getItem('token') : await AsyncStorage.getItem('token');
        if (!token) {
          navigation.replace('Login');
          return;
        }
        const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data?.user) {
          setRemoteUser(data.user);
          if (Platform.OS === 'web') window.localStorage.setItem('user', JSON.stringify(data.user));
          else await AsyncStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (e) {
        setError('Falha ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [navigation]);

  const user = useMemo(() => ({ name: 'User', email: 'you@example.com' }), []);

  const { displayName, displayEmail } = useMemo(() => {
    const source = remoteUser || user;
    let name = source?.name || source?.fullName || source?.username || '';
    const email = source?.email || '';
    if (!name && typeof email === 'string' && email.includes('@')) name = email.split('@')[0];
    return { displayName: name, displayEmail: email };
  }, [remoteUser, user]);

  const passwordMasked = useMemo(() => {
    let len = 0;
    try {
      const raw = Platform.OS === 'web' ? window.localStorage.getItem('passwordLength') : null;
      len = parseInt(raw || '0', 10);
    } catch {}
    const maskLen = Math.max(6, isNaN(len) ? 0 : len);
    return '•'.repeat(maskLen);
  }, []);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    } else {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={{ gap: 14 }}>
            <View>
              <Text style={styles.label}>Name</Text>
              <TextInput value={displayName} editable={false} style={styles.input} />
            </View>
            <View>
              <Text style={styles.label}>Email</Text>
              <TextInput value={displayEmail} editable={false} style={styles.input} />
            </View>
            <View>
              <Text style={styles.label}>Password</Text>
              <View>
                <TextInput value={showPassword ? '(tente novamente ano que vem) 🤪' : passwordMasked} editable={false} style={styles.input} />
                <TouchableOpacity style={styles.toggle} onPress={() => setShowPassword((v) => !v)}>
                  <Text style={styles.toggleText}>{showPassword ? 'Esconder' : 'Mostrar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const COLORS = { bg: '#363636', card: '#2D2B2B', text: '#E5E5E5', mute: '#9C9A9A' };
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 16, paddingVertical: 16 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  label: { color: COLORS.mute, fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#262424', color: COLORS.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  toggle: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 12 },
  toggleText: { color: COLORS.mute },
  logoutBtn: { backgroundColor: '#FFA652', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontWeight: '600' },
  error: { color: '#fca5a5', marginBottom: 8 },
});

