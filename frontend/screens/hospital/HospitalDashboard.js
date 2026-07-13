import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Alert,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import { COLORS, SPACING } from "../../theme";
import { EmptyState, StatusBadge } from "../../components/ui";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PRIORITY_STYLES = {
  Emergency: { bg: "#FFECEC", text: COLORS.primary },
  High: { bg: "#FFF4E5", text: COLORS.warning },
  Normal: { bg: "#EFF4FF", text: "#3B82F6" },
};

const QUICK_ACTIONS = [
  { id: "1", label: "Create Request", icon: "plus-circle-outline" },
  { id: "2", label: "View Requests", icon: "clipboard-list-outline" },
  { id: "3", label: "Blood Inventory", icon: "water" },
  { id: "4", label: "Transportation", icon: "truck-fast-outline" },
];

const HospitalDashboard = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [profile, setProfile] = useState({ full_name: "Hospital" });
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({
    blood_type: "O+",
    quantity: "1",
    status: "Pending",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadHospitalData);
    const interval = setInterval(loadHospitalData, 5000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, [navigation]);

  const loadHospitalData = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const [profileRes, requestsRes, inventoryRes] = await Promise.all([
        api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/hospital/request", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/blood_bank/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProfile(profileRes.data?.data || {});
      setRequests(requestsRes.data?.data || []);
      setInventory(inventoryRes.data?.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const handleCreateRequest = async () => {
    if (!form.blood_type || !form.quantity) {
      Alert.alert(
        "Missing details",
        "Please provide a blood type and quantity.",
      );
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      await api.post(
        "/hospital/request",
        {
          blood_type: form.blood_type,
          quantity: Number(form.quantity),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert("Success", "Your hospital request was created.");
      setForm({ blood_type: "O+", quantity: "1", status: "Pending" });
      loadHospitalData();
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not create request.",
      );
    } finally {
      setLoading(false);
    }
  };

  const overview = useMemo(() => {
    const total = requests.length;
    const open = requests.filter(
      (item) => !["completed", "cancelled", "rejected"].includes(
        String(item.status).toLowerCase(),
      ),
    ).length;
    const completedToday = requests.filter(
      (item) => String(item.status).toLowerCase() === "completed",
    ).length;

    return { totalRequests: total, open, completedToday };
  }, [requests]);

  if (!fontsLoaded) return null;

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
            <Text style={styles.name}>{profile.full_name || "Hospital"}</Text>
            <Text style={styles.subtitle}>Emergency Blood Management</Text>
          </View>

          <View style={styles.logoWrapper}>
            <MaterialCommunityIcons
              name="hospital-building"
              size={26}
              color="white"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Blood Request Overview</Text>
        <View style={styles.overviewRow}>
          <View style={styles.overviewCard}>
            <View
              style={[
                styles.overviewIconWrapper,
                { backgroundColor: COLORS.secondary },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.overviewNumber}>{overview.totalRequests}</Text>
            <Text style={styles.overviewLabel}>Blood Requests</Text>
          </View>

          <View style={styles.overviewCard}>
            <View
              style={[
                styles.overviewIconWrapper,
                { backgroundColor: "#FFF4E5" },
              ]}
            >
              <Ionicons name="time-outline" size={18} color={COLORS.warning} />
            </View>
            <Text style={styles.overviewNumber}>{overview.open}</Text>
            <Text style={styles.overviewLabel}>Open Requests</Text>
          </View>

          <View style={styles.overviewCard}>
            <View
              style={[
                styles.overviewIconWrapper,
                { backgroundColor: "#ECFDF3" },
              ]}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={18}
                color={COLORS.success}
              />
            </View>
            <Text style={styles.overviewNumber}>{overview.completedToday}</Text>
            <Text style={styles.overviewLabel}>Completed Today</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => {
                if (action.label === "View Requests")
                  navigation.navigate("HospitalRequests");
                if (action.label === "Blood Inventory")
                  navigation.navigate("HospitalInventory");
                if (action.label === "Create Request") {
                  Alert.alert(
                    "Create Request",
                    "Use the form below to submit a request.",
                  );
                }
              }}
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

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Create Blood Request</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.blood_type}
              onValueChange={(value) => setForm({ ...form, blood_type: value })}
              style={styles.picker}
              dropdownIconColor={COLORS.text}
            >
              <Picker.Item label="Select blood type" value="" />
              {BLOOD_TYPES.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            value={form.quantity}
            onChangeText={(value) => setForm({ ...form, quantity: value })}
            placeholder="Quantity"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={form.status}
            onChangeText={(value) => setForm({ ...form, status: value })}
            placeholder="Status"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreateRequest}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Creating..." : "Submit Request"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("HospitalRequests")}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: SPACING.sectionGap }}>
          {requests.length === 0 ? (
            <EmptyState icon="medkit-outline" title="No active requests" message="Create an emergency request when your hospital needs blood." />
          ) : requests.slice(0, 3).map((item) => {
            const priorityStyle =
              PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Normal;
            return (
              <View key={item.id} style={styles.requestCard}>
                <View style={styles.requestTopRow}>
                  <Text style={styles.requestTitle}>Blood Request</Text>
                  <StatusBadge status={item.status || "pending"} />
                </View>

                <View style={styles.requestGrid}>
                  <View style={styles.requestGridItem}>
                    <Text style={styles.requestGridLabel}>Blood Type</Text>
                    <View style={styles.bloodTypePill}>
                      <Text style={styles.bloodTypePillText}>
                        {item.blood_type}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestGridItem}>
                    <Text style={styles.requestGridLabel}>Quantity</Text>
                    <Text style={styles.requestGridValue}>
                      {item.quantity} bag{item.quantity > 1 ? "s" : ""}
                    </Text>
                  </View>
                  <View style={styles.requestGridItem}>
                    <Text style={styles.requestGridLabel}>Inventory</Text>
                    <Text style={styles.requestGridValue}>
                      {inventory.length}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HospitalDashboard;

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 40,
  },

  // ---------- HEADER ----------
  header: {
    paddingVertical: SPACING.screenPadding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    // marginBottom: SPACING.sectionGap,
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
    marginTop: 2,
  },

  subtitle: {
    marginTop: 4,
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

  // ---------- SECTION TITLE ----------
  sectionTitle: {
    marginTop: SPACING.sectionGap,
    marginBottom: 14,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
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

  // ---------- OVERVIEW ----------
  overviewRow: {
    flexDirection: "row",
    gap: 12,
  },

  overviewCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 6,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  overviewIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
    textAlign: "center",
  },

  // ---------- QUICK ACTIONS ----------
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },

  actionCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 4,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
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
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    textAlign: "center",
    color: COLORS.text,
    paddingHorizontal: 6,
  },

  // ---------- ACTIVE REQUEST CARD ----------
  requestCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 4,
    padding: SPACING.cardPadding - 4,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
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

  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  priorityPillText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
  },

  requestGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  requestGridItem: {
    alignItems: "flex-start",
  },

  requestGridLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
    marginBottom: 6,
  },

  requestGridValue: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: COLORS.text,
  },

  bloodTypePill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },

  bloodTypePillText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    color: "white",
  },

  requestDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  requestBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },

  statusText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: COLORS.text,
  },

  requestTime: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
  },

  viewDetailsButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: SPACING.buttonRadius,
  },

  viewDetailsText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: COLORS.primary,
  },

  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 4,
    padding: SPACING.cardPadding - 4,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontFamily: "Poppins_500Medium",
    color: COLORS.text,
  },

  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
  },

  submitButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "white",
  },

  activityCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 4,
    padding: SPACING.cardPadding - 4,
    marginBottom: SPACING.sectionGap,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },

  activityTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: COLORS.text,
  },

  activityTime: {
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
  },

  activityDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
