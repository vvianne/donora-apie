import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";

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
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      if (response.data.success) {
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
    <View style={styles.container}>
      <Text style={styles.title}>Donora</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  loginButton: {
    backgroundColor: "#D32F2F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  registerButton: {
    marginTop: 20,
    alignItems: "center",
  },

  registerText: {
    color: "#D32F2F",
    fontWeight: "600",
  },

  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
