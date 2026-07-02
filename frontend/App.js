import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DonorDashboard from "./screens/DonorDashboard";
import HospitalDashboard from "./screens/HospitalDashboard";
import BloodBankDashboard from "./screens/BloodBankDashboard";
import TransportationDashboard from "./screens/TransportationDashboard";
import InventoryScreen from "./screens/InventoryScreen";
import RequestsScreen from "./screens/RequestsScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="DonorDashboard" component={DonorDashboard} />
        <Stack.Screen name="HospitalDashboard" component={HospitalDashboard} />
        <Stack.Screen
          name="BloodBankDashboard"
          component={BloodBankDashboard}
        />
        <Stack.Screen
          name="TransportationDashboard"
          component={TransportationDashboard}
        />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="Requests" component={RequestsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

// import React from "react";
// import { View, Text } from "react-native";

// export default function LoginScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text>LOGIN SCREEN</Text>
//     </View>
//   );
// }
