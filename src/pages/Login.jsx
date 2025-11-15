import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";

const COLORS = {
  primary: "#FFA652",
  grayPrimary: "#6F6F6F",
  graySecondary: "#9C9A9A",
};

export default function Login() {
  const navigation = useNavigation();
  const API_BASE = Platform.select({ web: 'http://localhost:3000', ios: 'http://localhost:3000', android: 'http://10.0.2.2:3000', default: 'http://localhost:3000' });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const token = response?.data?.token;
      const user = response?.data?.user || { name: (typeof email === 'string' && email.includes('@')) ? email.split('@')[0] : 'User', email };

      if (Platform.OS === 'web') {
        if (token) localStorage.setItem('token', String(token));
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('passwordLength', String((password || '').length));
      } else {
        if (token) await AsyncStorage.setItem('token', String(token));
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('passwordLength', String((password || '').length));
      }

      navigation.replace("Directions");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data?.message || "Erro ao fazer login");
      } else {
        setErrorMsg("Ocorreu um erro inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Image
          source={require("../../assets/favicon.png")}
          style={{ width: 60, height: 60 }}
        />

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Log in to your account to continue
        </Text>

        <View style={styles.inputWrapper}>
          <FontAwesome
            name="user"
            size={20}
            color={COLORS.graySecondary}
            style={styles.icon}
          />
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <FontAwesome
            name="lock"
            size={20}
            color={COLORS.graySecondary}
            style={styles.icon}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#bbb"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        {errorMsg.length > 0 && (
          <Text style={styles.error}>{errorMsg}</Text>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.newText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.signup}> Sign up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Image
              source={{
                uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png",
              }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn}>
            <Image
              source={{
                uri: "https://logodownload.org/wp-content/uploads/2014/09/facebook-logo-3-1.png",
              }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn}>
            <Image
              source={{
                uri: "https://pngimg.com/uploads/microsoft/microsoft_PNG5.png",
              }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Microsoft</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    minHeight: "100%",
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  imgBanner: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
  },

  box: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 25,
    marginTop: 20,
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "600",
    color: COLORS.grayPrimary,
    marginTop: 10,
  },

  subtitle: {
    color: COLORS.graySecondary,
    marginBottom: 25,
    fontSize: 14,
  },

  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: 45,
    fontSize: 15,
    color: "#000",
  },

  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },

  forgot: {
    color: COLORS.graySecondary,
    alignSelf: "flex-end",
    marginBottom: 20,
    fontSize: 13,
  },

  loginButton: {
    backgroundColor: "#222",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
  },

  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    marginTop: 15,
  },

  newText: {
    color: COLORS.graySecondary,
  },

  signup: {
    color: COLORS.grayPrimary,
    textDecorationLine: "underline",
    marginLeft: 5,
  },

  socialRow: {
    flexDirection: "row",
    marginTop: 25,
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    elevation: 2,
  },

  socialIcon: {
    width: 22,
    height: 22,
    marginRight: 6,
    resizeMode: "contain",
  },

  socialText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
