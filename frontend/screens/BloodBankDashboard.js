import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, SPACING } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { EmptyState, LoadingState } from "../components/ui";

const menuItems = [
  {
    id: "inventory",
    title: "Inventory",
    subtitle: "Manage stock and availability",
    icon: "medical",
    screen: "Inventory",
  },
  {
    id: "requests",
    title: "Requests",
    subtitle: "Review blood requests",
    icon: "document-text",
    screen: "Requests",
  },
  {
    id: "profile",
    title: "Profile",
    subtitle: "Manage your account",
    icon: "person-circle",
    screen: "Profile",
  },
];

const BloodBankDashboard = ({ navigation }) => {
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchData);
    const interval = setInterval(fetchData, 5000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, [navigation]);

  const fetchData = async () => {
    try {
      setError("");
      const token = await AsyncStorage.getItem("access_token");

      const inventoryResponse = await api.get("/blood_bank/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const requestResponse = await api.get("/blood_bank/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInventory(inventoryResponse.data.data);
      setRequests(requestResponse.data.data);
    } catch (err) {
      console.log(err.response?.data);
      console.log(err.message);
      setError("Unable to load blood bank information.");
    } finally {
      setLoading(false);
    }
  };

  const totalBags = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const lowStock = inventory.filter((item) => item.quantity <= 5).length;

  const pendingRequests = requests.filter(
    (item) => ["pending", "open", "urgent", "active"].includes(
      String(item.status).toLowerCase(),
    ),
  ).length;

  const goToScreen = (screen) => {
    navigation?.navigate?.(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <View style={styles.headerIcon}><Ionicons name="water" size={24} color="white" /></View>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.title}>Blood Bank Dashboard</Text>
        <Text style={styles.subtitle}>
          Quick access to inventory, requests, and profile.
        </Text>
      </View>

      {loading ? <LoadingState label="Loading inventory summary…" /> : null}
      {!!error && !loading ? <EmptyState icon="cloud-offline-outline" title="Dashboard unavailable" message={error} /> : null}

      {!loading && !error && <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.sectionTitle}>Inventory Summary</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Updated</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalBags}</Text>{" "}
            <Text style={styles.summaryLabel}>Total Bags</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{lowStock}</Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{pendingRequests}</Text>
            <Text style={styles.summaryLabel}>Pending Requests</Text>
          </View>
        </View>
      </View>}

      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            activeOpacity={0.85}
            onPress={() => goToScreen(item.screen)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name={item.icon} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  greeting: {
    fontSize: 14,
    color: COLORS.subtitle,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subtitle,
  },
  summaryCard: {
    marginHorizontal: SPACING.screenPadding,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  summaryItem: {
    width: "31%",
    minWidth: 90,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.subtitle,
  },
  menuGrid: {
    paddingHorizontal: SPACING.screenPadding,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuCard: {
    width: "31%",
    minWidth: 100,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.buttonRadius,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    textAlign: "center",
  },
  menuSubtitle: {
    fontSize: 11,
    color: COLORS.subtitle,
    textAlign: "center",
  },
});

export default BloodBankDashboard;
