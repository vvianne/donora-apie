import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import { COLORS, SPACING } from "../../theme";

// ============================================
// DUMMY DATA — swap with real API data later
// ============================================
const HOSPITAL = {
  name: "Hospital 1",
};

const OVERVIEW = {
  totalRequests: 12,
  open: 4,
  completedToday: 8,
};

const QUICK_ACTIONS = [
  { id: "1", label: "Create Request", icon: "plus-circle-outline", lib: "mci" },
  {
    id: "2",
    label: "View Requests",
    icon: "clipboard-list-outline",
    lib: "mci",
  },
  { id: "3", label: "Blood Inventory", icon: "water", lib: "mci" },
  { id: "4", label: "Transportation", icon: "truck-fast-outline", lib: "mci" },
];

const PRIORITY_STYLES = {
  Emergency: { bg: "#FFECEC", text: COLORS.primary },
  High: { bg: "#FFF4E5", text: COLORS.warning },
  Normal: { bg: "#EFF4FF", text: "#3B82F6" },
};

const ACTIVE_REQUESTS = [
  {
    id: "1",
    patientId: "#P-1024",
    bloodType: "O+",
    units: "3 Bags",
    priority: "Emergency",
    status: "Waiting Donor",
    time: "12 mins ago",
  },
  {
    id: "2",
    patientId: "#P-2048",
    bloodType: "A-",
    units: "2 Bags",
    priority: "High",
    status: "Matching Donor",
    time: "34 mins ago",
  },
  {
    id: "3",
    patientId: "#P-5012",
    bloodType: "B+",
    units: "1 Bag",
    priority: "Normal",
    status: "Pending",
    time: "1 hr ago",
  },
];

const RECENT_ACTIVITY = [
  {
    id: "1",
    icon: "checkmark-circle",
    title: "Blood request created",
    time: "09:24",
  },
  {
    id: "2",
    icon: "checkmark-circle",
    title: "Blood inventory updated",
    time: "08:56",
  },
  {
    id: "3",
    icon: "checkmark-circle",
    title: "Emergency request completed",
    time: "Yesterday",
  },
];

// ============================================
// COMPONENT
// ============================================
const HospitalDashboard = () => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============== HOSPITAL HEADER ============== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Good Morning</Text>
            <Text style={styles.name}>{HOSPITAL.name}</Text>
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

        {/* ============== BLOOD REQUEST OVERVIEW ============== */}
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
            <Text style={styles.overviewNumber}>{OVERVIEW.totalRequests}</Text>
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
            <Text style={styles.overviewNumber}>{OVERVIEW.open}</Text>
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
            <Text style={styles.overviewNumber}>{OVERVIEW.completedToday}</Text>
            <Text style={styles.overviewLabel}>Completed Today</Text>
          </View>
        </View>

        {/* ============== QUICK ACTIONS ============== */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              activeOpacity={0.8}
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

        {/* ============== ACTIVE BLOOD REQUESTS ============== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Blood Requests</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: SPACING.sectionGap }}>
          {ACTIVE_REQUESTS.map((item) => {
            const priorityStyle =
              PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Normal;

            return (
              <View key={item.id} style={styles.requestCard}>
                <View style={styles.requestTopRow}>
                  <Text style={styles.requestTitle}>Emergency Request</Text>
                  <View
                    style={[
                      styles.priorityPill,
                      { backgroundColor: priorityStyle.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityPillText,
                        { color: priorityStyle.text },
                      ]}
                    >
                      {item.priority}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestGrid}>
                  <View style={styles.requestGridItem}>
                    <Text style={styles.requestGridLabel}>Patient ID</Text>
                    <Text style={styles.requestGridValue}>
                      {item.patientId}
                    </Text>
                  </View>

                  <View style={styles.requestGridItem}>
                    <Text style={styles.requestGridLabel}>Blood Type</Text>
                    <View style={styles.bloodTypePill}>
                      <Text style={styles.bloodTypePillText}>
                        {item.bloodType}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestGridItem}>
                    <Text style={styles.requestGridLabel}>Units Needed</Text>
                    <Text style={styles.requestGridValue}>{item.units}</Text>
                  </View>
                </View>

                <View style={styles.requestDivider} />

                <View style={styles.requestBottomRow}>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{item.status}</Text>
                    <Text style={styles.requestTime}>· {item.time}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* ============== RECENT ACTIVITY ============== */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.activityCard}>
          {RECENT_ACTIVITY.map((item, index) => (
            <View key={item.id}>
              <View style={styles.activityRow}>
                <Ionicons name={item.icon} size={18} color={COLORS.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              </View>

              {index < RECENT_ACTIVITY.length - 1 && (
                <View style={styles.activityDivider} />
              )}
            </View>
          ))}
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

  // ---------- RECENT ACTIVITY ----------
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
