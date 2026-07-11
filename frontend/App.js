import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import DonorDashboard from "./screens/donor/DonorDashboard";
import HospitalDashboard from "./screens/hospital/HospitalDashboard";
import BloodBankDashboard from "./screens/BloodBankDashboard";
import TransportationDashboard from "./screens/TransportationDashboard";
import InventoryScreen from "./screens/InventoryScreen";
import RequestsScreen from "./screens/RequestsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import DonorNavigator from "./navigation/DonorNavigator";

const Stack = createStackNavigator();

const App = () => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="Donor"
          component={DonorNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HospitalDashboard"
          component={HospitalDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BloodBankDashboard"
          component={BloodBankDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TransportationDashboard"
          component={TransportationDashboard}
        />
        <Stack.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Requests"
          component={RequestsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
