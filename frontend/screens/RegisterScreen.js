import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', { username, password, role });
      if (response.data.success) {
        navigation.navigate('Login');
      }
    } catch (err) {
      setError('Registration failed.');
    }
  };

  return (
    <View>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput placeholder="Role" value={role} onChangeText={setRole} />
      <Button title="Register" onPress={handleRegister} />
      {error ? <Text>{error}</Text> : null}
    </View>
  );
};

export default RegisterScreen;
