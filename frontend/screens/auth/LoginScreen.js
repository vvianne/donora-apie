import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SHADOWS, SPACING } from "../../theme";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getDashboardRoute = (role = "") => {
    const normalizedRole = String(role || "").toLowerCase();

    switch (normalizedRole) {
      case "hospital":
        return "HospitalDashboard";
      case "blood_bank":
      case "bloodbank":
        return "BloodBankDashboard";
      case "transportation":
      case "transport":
        return "TransportationDashboard";
      case "donor":
      default:
        return "Donor";
    }
  };

  const handleLogin = async () => {
    setError("");

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      console.log(response.data);

      if (response.data.access_token) {
        await AsyncStorage.setItem("access_token", response.data.access_token);

        const routeName = getDashboardRoute(response.data.role);

        navigation.reset({
          index: 0,
          routes: [{ name: routeName }],
        });
      }
    } catch (err) {
      console.log(err.response?.data);
      console.log(err.message);

      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
      <View style={styles.brandMark}><Ionicons name="water" size={30} color="white" /></View>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue making a difference.</Text>

      <View style={styles.formCard}>
      <Text style={styles.label}>Username</Text>

      <TextInput
        placeholder="Enter your username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Enter your password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <View style={styles.errorBox}><Ionicons name="alert-circle" size={16} color={COLORS.danger} /><Text style={styles.error}>{error}</Text></View> : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.registerText}>New to Donora? <Text style={styles.registerStrong}>Create account</Text></Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: SPACING.screenPadding,
  },
  brandMark: {
    width: 60, height: 60, borderRadius: 20, backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 20,
    ...SHADOWS.card,
  },

  title: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    color: COLORS.subtitle,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: COLORS.card, borderRadius: SPACING.cardRadius, padding: SPACING.cardPadding,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card,
  },
  label: {
    fontFamily: "Poppins_600SemiBold", fontSize: 13, color: COLORS.text, marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.inputRadius,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    backgroundColor: COLORS.background,
    fontFamily: "Poppins_400Regular",
  },

  loginButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    justifyContent: "center",
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 15,
  },

  registerButton: {
    marginTop: 20,
    alignItems: "center",
  },

  registerText: {
    color: COLORS.subtitle, fontFamily: "Poppins_400Regular", fontSize: 13,
  },
  registerStrong: { color: COLORS.primary, fontFamily: "Poppins_600SemiBold" },

  error: {
    color: COLORS.danger, fontFamily: "Poppins_500Medium", fontSize: 12, flex: 1,
  },
  errorBox: { flexDirection: "row", gap: 8, backgroundColor: "#FEF3F2", borderRadius: 12, padding: 12, marginBottom: 12 },
});
