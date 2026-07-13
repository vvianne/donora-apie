import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HospitalDashboard from "../screens/hospital/HospitalDashboard";
import RequestsScreen from "../screens/RequestsScreen";
import InventoryScreen from "../screens/InventoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import BottomNav from "../BottomNav";

const Tab = createBottomTabNavigator();

const HOSPITAL_NAV_ITEMS = [
  { id: "home", route: "HospitalHome", label: "Home", icon: "home" },
  {
    id: "requests",
    route: "HospitalRequests",
    label: "Requests",
    icon: "document-text",
  },
  {
    id: "inventory",
    route: "HospitalInventory",
    label: "Inventory",
    icon: "water",
  },
  { id: "profile", route: "HospitalProfile", label: "Profile", icon: "person" },
];

export default function HospitalNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} items={HOSPITAL_NAV_ITEMS} />}
    >
      <Tab.Screen name="HospitalHome" component={HospitalDashboard} />
      <Tab.Screen name="HospitalRequests" component={RequestsScreen} />
      <Tab.Screen name="HospitalInventory" component={InventoryScreen} />
      <Tab.Screen name="HospitalProfile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
