import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import api from "../../services/api";
import { Picker } from "@react-native-picker/picker";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const handleRegister = async () => {
    try {
      const response = await api.post("/auth/register", {
        username,
        password,
        role,
        name,
        location,
      });
      if (response.data.success) {
        navigation.navigate("Login");
      }
    } catch (err) {
      setError("Registration failed.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Donora and get started</Text>

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

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={setRole}
          style={styles.picker}
          dropdownIconColor="#D32F2F"
        >
          <Picker.Item label="Select Role" value="" color="#999" />
          <Picker.Item label="Donor" value="donor" />
          <Picker.Item label="Hospital" value="hospital" />
          <Picker.Item label="Blood Bank" value="blood_bank" />
          <Picker.Item label="Transportation" value="transportation" />
        </Picker>
      </View>

      {(role === "hospital" || role === "blood_bank") && (
        <>
          <TextInput
            placeholder={
              role === "hospital" ? "Hospital Name" : "Blood Bank Name"
            }
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Location"
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
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

  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
    marginLeft: 4,
    overflow: "hidden",
  },

  picker: {
    flex: 1,
    height: 56,
    color: "#333",
    fontFamily: "System",
  },

  registerButton: {
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

  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },

  loginText: {
    color: "#D32F2F",
    fontWeight: "600",
  },

  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
