import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
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
    <View>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Picker
        selectedValue={role}
        onValueChange={(itemValue) => setRole(itemValue)}
      >
        <Picker.Item label="Select your role" value="" />
        <Picker.Item label="Donor" value="donor" />
        <Picker.Item label="Hospital" value="hospital" />
        <Picker.Item label="Blood Bank" value="blood_bank" />
        <Picker.Item label="Transportation" value="transportation" />
      </Picker>
      {(role === "hospital" || role === "blood_bank") && (
        <>
          <TextInput
            placeholder={
              role === "hospital" ? "Hospital Name" : "Blood Bank Name"
            }
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
          />
        </>
      )}
      <Button title="Register" onPress={handleRegister} />
      {error ? <Text>{error}</Text> : null}
    </View>
  );
};

export default RegisterScreen;
