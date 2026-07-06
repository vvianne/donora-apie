import React from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DonorDashboard from "../screens/donor/DonorDashboard";
import NearbyScreen from "../screens/donor/NearbyScreen";
import HistoryScreen from "../screens/donor/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import BottomNav from "../BottomNav";
import { COLORS, SPACING } from "../theme";

const Tab = createBottomTabNavigator();

// Simple placeholders so the tab bar has somewhere to go.
// Swap these for your real History and Profile screens whenever they're ready.

export default function DonorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen name="Home" component={DonorDashboard} />
      <Tab.Screen name="Nearby" component={NearbyScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.subtitle,
  },
});
