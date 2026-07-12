import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { COLORS, SHADOWS, SPACING } from "../../theme";

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.brandMark}>
          <Ionicons name="heart" size={26} color="white" />
        </View>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Join a community built around helping others.
        </Text>
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
              <Text style={styles.label}>Hospital Name</Text>
              <TextInput
                placeholder={
                  role === "hospital"
                    ? "Enter Hospital name"
                    : "Enter Blood Bank name"
                }
                style={styles.input}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                placeholder="Enter location"
                style={styles.input}
                value={location}
                onChangeText={setLocation}
              />
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.loginStrong}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.background,
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: SPACING.screenPadding,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
    ...SHADOWS.card,
  },

  title: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    color: COLORS.subtitle,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },

  label: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 8,
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

  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.inputRadius,
    backgroundColor: COLORS.background,
    marginBottom: 16,
    overflow: "hidden",
  },

  picker: {
    flex: 1,
    height: 56,
    color: "#333",
    fontFamily: "System",
  },

  registerButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    justifyContent: "center",
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },

  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },

  loginText: {
    color: COLORS.subtitle,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
  },
  loginStrong: { color: COLORS.primary, fontFamily: "Poppins_600SemiBold" },

  error: {
    color: COLORS.danger,
    marginBottom: 10,
    textAlign: "center",
  },
});
