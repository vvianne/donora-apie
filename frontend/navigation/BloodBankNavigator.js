import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import BottomNav from "../BottomNav";
import BloodBankDashboard from "../screens/BloodBankDashboard";
import InventoryScreen from "../screens/InventoryScreen";
import RequestsScreen from "../screens/RequestsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const BLOOD_BANK_NAV_ITEMS = [
  {
    id: "dashboard",
    route: "BloodBankHome",
    label: "Dashboard",
    icon: "home",
  },
  {
    id: "inventory",
    route: "BloodBankInventory",
    label: "Inventory",
    icon: "water",
  },
  {
    id: "requests",
    route: "BloodBankRequests",
    label: "Requests",
    icon: "document-text",
  },
  {
    id: "profile",
    route: "BloodBankProfile",
    label: "Profile",
    icon: "person",
  },
];

export default function BloodBankNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} items={BLOOD_BANK_NAV_ITEMS} />}
    >
      <Tab.Screen name="BloodBankHome" component={BloodBankDashboard} />
      <Tab.Screen name="BloodBankInventory" component={InventoryScreen} />
      <Tab.Screen name="BloodBankRequests" component={RequestsScreen} />
      <Tab.Screen name="BloodBankProfile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
