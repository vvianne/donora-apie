import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import axios from "axios";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      if (response.data.success) {
        // Navigate to the appropriate dashboard based on user role
        navigation.navigate("DonorDashboard");
      }
      // } catch (err) {
      //   setError('Invalid credentials.');
      // }
    } catch (err) {
      console.log(err.response?.data);
      console.log(err.message);
      setError(err.response?.data?.message || err.message);
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
      <Button title="Login" onPress={handleLogin} />
      {error ? <Text>{error}</Text> : null}
    </View>
  );
};

export default LoginScreen;
