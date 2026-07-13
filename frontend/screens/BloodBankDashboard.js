import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS, SHADOWS, SPACING } from "../theme";
import api from "../services/api";
import { EmptyState, LoadingState, StatusBadge } from "../components/ui";

const QUICK_ACTIONS = [
  {
    id: "inventory",
    label: "Manage Inventory",
    icon: "water",
    route: "BloodBankInventory",
  },
  {
    id: "requests",
    label: "Incoming Requests",
    icon: "clock",
    route: "BloodBankRequests",
  },
  {
    id: "stock",
    label: "Review Low Stock",
    icon: "alert-circle",
    route: "BloodBankInventory",
  },
  {
    id: "profile",
    label: "Blood Bank Profile",
    icon: "water",
    route: "BloodBankProfile",
  },
];

const BloodBankDashboard = ({ navigation }) => {
  const [profile, setProfile] = useState({ full_name: "Blood Bank" });
  const [inventory, setInventory] = useState([]);
  const [inventoryTotals, setInventoryTotals] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener("focus", fetchData);
    const interval = setInterval(fetchData, 5000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigation]);

  const fetchData = async () => {
    try {
      setError("");
      const token = await AsyncStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const [profileResponse, inventoryResponse, requestResponse] =
        await Promise.all([
          api.get("/auth/profile", { headers }),
          api.get("/blood_bank/inventory", { headers }),
          api.get("/blood_bank/requests", { headers }),
        ]);

      setProfile(profileResponse.data?.data || {});
      setInventory(inventoryResponse.data?.data || []);
      setInventoryTotals(inventoryResponse.data?.totals || {});
      setRequests(requestResponse.data?.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Unable to load blood bank information.",
      );
    } finally {
      setLoading(false);
    }
  };

  const overview = useMemo(() => {
    const locationStock = Object.values(inventoryTotals).reduce(
      (sum, quantity) => sum + Number(quantity || 0),
      0,
    );
    const lowStock = inventory.filter(
      (item) =>
        item.is_owned_by_current_user && Number(item.quantity || 0) <= 5,
    ).length;
    const pendingRequests = requests.filter((item) =>
      ["pending", "open", "urgent", "active"].includes(
        String(item.status || "").toLowerCase(),
      ),
    ).length;

    return { locationStock, lowStock, pendingRequests };
  }, [inventory, inventoryTotals, requests]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Good Morning</Text>
            <Text style={styles.name}>
              {profile.full_name || profile.username || "Blood Bank"}
            </Text>
            <Text style={styles.subtitle}>Blood Inventory Management</Text>
          </View>

          <View style={styles.logoWrapper}>
            <Ionicons name="water" size={26} color={COLORS.card} />
          </View>
        </View>

        {loading ? <LoadingState label="Loading inventory summary…" /> : null}
        {!!error && !loading ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Dashboard unavailable"
            message={error}
          />
        ) : null}

        {!loading && !error ? (
          <>
            <Text style={styles.sectionTitle}>Inventory Overview</Text>
            <View style={styles.overviewRow}>
              <View style={styles.overviewCard}>
                <View style={styles.overviewIconWrapper}>
                  <Ionicons name="water" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.overviewNumber}>
                  {overview.locationStock}
                </Text>
                <Text style={styles.overviewLabel}>Location Stock</Text>
              </View>

              <View style={styles.overviewCard}>
                <View
                  style={[
                    styles.overviewIconWrapper,
                    { backgroundColor: COLORS.surfaceMuted },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={COLORS.warning}
                  />
                </View>
                <Text style={styles.overviewNumber}>{overview.lowStock}</Text>
                <Text style={styles.overviewLabel}>My Low Stock</Text>
              </View>

              <View style={styles.overviewCard}>
                <View
                  style={[
                    styles.overviewIconWrapper,
                    { backgroundColor: COLORS.surfaceMuted },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={COLORS.info}
                  />
                </View>
                <Text style={styles.overviewNumber}>
                  {overview.pendingRequests}
                </Text>
                <Text style={styles.overviewLabel}>Pending Requests</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(action.route)}
                >
                  <View style={styles.actionIconWrapper}>
                    <MaterialCommunityIcons
                      name={action.icon}
                      size={26}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.actionTitle}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Requests</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("BloodBankRequests")}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {requests.length === 0 ? (
              <EmptyState
                icon="document-text-outline"
                title="No incoming requests"
                message="New hospital blood requests will appear here."
              />
            ) : (
              requests.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.requestCard}>
                  <View style={styles.requestTopRow}>
                    <Text style={styles.requestTitle}>
                      {item.blood_type} Blood Request
                    </Text>
                    <StatusBadge status={item.status || "pending"} />
                  </View>
                  <Text style={styles.requestMeta}>
                    {item.quantity} bag{Number(item.quantity) === 1 ? "" : "s"}
                  </Text>
                </View>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BloodBankDashboard;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: Platform.OS === "android" ? SPACING.md : SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingVertical: SPACING.screenPadding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  hello: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
  },
  name: {
    fontFamily: "Poppins_700Bold",
    fontSize: 26,
    color: COLORS.text,
    marginTop: SPACING.xs / 2,
  },
  subtitle: {
    marginTop: SPACING.xs,
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: COLORS.primary,
  },
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    marginTop: SPACING.sectionGap,
    marginBottom: 14,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
  },
  overviewRow: { flexDirection: "row", gap: 12 },
  overviewCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 6,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    ...SHADOWS.card,
  },
  overviewIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  overviewNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: COLORS.text,
  },
  overviewLabel: {
    marginTop: SPACING.xs,
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
    textAlign: "center",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: SPACING.md,
  },
  actionCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 4,
    paddingVertical: SPACING.cardPadding,
    alignItems: "center",
    ...SHADOWS.card,
  },
  actionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTitle: {
    marginTop: 10,
    paddingHorizontal: SPACING.sm,
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: COLORS.text,
    textAlign: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: COLORS.primary,
  },
  requestCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 4,
    padding: SPACING.cardPadding - 4,
    marginBottom: 14,
    ...SHADOWS.card,
  },
  requestTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: COLORS.text,
  },
  requestMeta: {
    marginTop: SPACING.sm,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },
});
