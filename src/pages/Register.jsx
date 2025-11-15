import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const COLORS = {
  primary: '#FFA652',
  grayPrimary: '#6F6F6F',
  graySecondary: '#9C9A9A',
};

export default function Register() {
  const navigation = useNavigation();
  const API_BASE = Platform.select({ web: 'http://localhost:3000', ios: 'http://localhost:3000', android: 'http://10.0.2.2:3000', default: 'http://localhost:3000' });
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        name: fullName.trim(),
        email: email.trim(),
        password,
      });

      setSuccessMsg('User created successfully!');
      setFullName('');
      setEmail('');
      setPassword('');
      navigation.navigate('Login');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const server = error.response?.data;
        const msg = typeof server === 'string' ? server : server?.message || server?.error || 'Error creating user';
        const status = error.response?.status;
        setErrorMsg(status ? `${status}: ${msg}` : String(msg));
      } else {
        setErrorMsg('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Image
          source={Platform.select({ web: { uri: '/favicon.ico' }, default: require('../../assets/bus2.png') })}
          style={{ width: 60, height: 60 }}
        />

        <Text style={styles.title}>Welcome to bus!</Text>
        <Text style={styles.subtitle}>Register your account</Text>

        <View style={styles.formGroup}>
          <TextInput
            placeholder="Full name"
            placeholderTextColor="#bbb"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>

        {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        {!!successMsg && <Text style={styles.success}>{successMsg}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.infoText}>Have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}> Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    minHeight: '100%',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  box: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.grayPrimary,
    marginTop: 12,
  },
  subtitle: {
    color: COLORS.graySecondary,
    marginBottom: 20,
    fontSize: 14,
  },
  formGroup: {
    width: '100%',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    fontSize: 15,
    color: '#000',
    marginBottom: 12,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  success: {
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#1f2937',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginTop: 14,
  },
  infoText: {
    color: COLORS.graySecondary,
  },
  linkText: {
    color: COLORS.grayPrimary,
    textDecorationLine: 'underline',
    marginLeft: 5,
  },
});
