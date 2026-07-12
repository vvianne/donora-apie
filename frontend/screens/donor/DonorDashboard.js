import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import { COLORS, SPACING } from "../../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";
import { StatusBadge } from "../../components/ui";

const QUICK_ACTIONS = [
  {
    id: "1",
    label: "Find Blood Bank",
    icon: "hospital-building",
    lib: "mci",
    screen: "Nearby",
  },
  {
    id: "2",
    label: "Nearby Requests",
    icon: "map-marker-radius",
    lib: "mci",
    screen: "Nearby",
  },
  {
    id: "3",
    label: "Donation History",
    icon: "document-text-outline",
    lib: "ion",
    screen: "History",
  },
  {
    id: "4",
    label: "Profile",
    icon: "person-outline",
    lib: "ion",
    screen: "Profile",
  },
];

const ACHIEVEMENTS = [
  { id: "1", label: "First Donation", icon: "🥉", earned: true },
  { id: "2", label: "Life Saver", icon: "❤️", earned: true },
  { id: "3", label: "Community Hero", icon: "⭐", earned: true },
  { id: "4", label: "10 Donations", icon: "🏅", earned: false },
  { id: "5", label: "Regular Donor", icon: "🎖", earned: false },
];

const DonorDashboard = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [responseSent, setResponseSent] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);

  const [activeEmergency, setActiveEmergency] = useState(null);
  const [liveDistance, setLiveDistance] = useState("Calculating...");

  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    role: "donor",
    blood_type: "",
    verification_status: "verified",
    location: "",
  });

  const [donationCount, setDonationCount] = useState(0);
  const [livesSaved, setLivesSaved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dashboardAchievements = ACHIEVEMENTS.map((item) => ({
    ...item,
    earned:
      item.id === "1" || item.id === "2"
        ? donationCount >= 1
        : item.id === "3"
          ? donationCount >= 5
          : donationCount >= 10,
  }));

  // Fungsi Respond yang sekarang terhubung ke API (Database)
  const handleRespond = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await api.post(
        "/donor/response",
        {
          blood_request_id: activeEmergency.id,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setShowResponseModal(false);
      await loadDashboardData();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to respond");
    }
  };

  useEffect(() => {
    // Navigation listener biar otomatis refresh tiap kali buka dashboard (misal habis dari Nearby)
    const unsubscribe = navigation.addListener("focus", () => {
      loadDashboardData();
    });
    const interval = setInterval(loadDashboardData, 5000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, [navigation]);

  const loadDashboardData = async () => {
    try {
      setError("");
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/donor/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data?.data || {};
      const profileData = data.profile || {};
      setProfile(profileData);
      setDonationCount(data.statistics?.completed_donations || 0);
      setLivesSaved(data.statistics?.lives_saved || 0);
      const requestItem = (data.requests || []).find(
        (item) => item.blood_type === profileData.blood_type && !item.responded,
      );
      setResponseSent(false);
      setActiveEmergency(requestItem ? {
        id: requestItem.id,
        active: true,
        hospital: requestItem.hospital_name,
        bloodType: requestItem.blood_type,
        distance: requestItem.location || "Location not set",
        time: requestItem.status,
      } : null);
      setLiveDistance(requestItem?.location || "Location not set");
      setRecentActivities((data.recent_activities || []).map((item) => ({
        ...item,
        icon: item.type === "donation" ? "water" : "alert-circle",
        date: item.date ? new Date(item.date).toLocaleString() : "Date unavailable",
        status: item.status
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
          : "Unknown",
      })));
    } catch (error) {
      console.log(
        "Dashboard load failed",
        error.response?.data || error.message,
      );
      setError("Unable to load dashboard data. Return to this page to retry.");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  if (loading) return (
    <SafeAreaView style={[styles.safeArea, { justifyContent: "center" }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Modal
        visible={showResponseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResponseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Head to the hospital</Text>
            <Text style={styles.modalText}>
              Confirm that you are on your way to help with this urgent request.
            </Text>

            <View style={styles.mapPreviewBox}>
              <View style={styles.mapPreviewGrid} />
              <View style={styles.mapPinUser} />
              <View style={styles.mapPinHospital} />
              <Text style={styles.mapLabelUser}>You</Text>
              <Text style={styles.mapLabelHospital}>
                {activeEmergency?.hospital}
              </Text>
            </View>

            <View style={styles.routeInfo}>
              <Text style={styles.routeTitle}>{activeEmergency?.hospital}</Text>
              <Text style={styles.routeSubtitle}>
                Approx. {activeEmergency?.distance}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowResponseModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleRespond}
              >
                <Text style={styles.modalConfirmText}>Respond</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAchievementsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAchievementsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.achievementsModalCard}>
            <Text style={styles.modalTitle}>Achievements</Text>
            <Text style={styles.modalText}>
              Your progress and the badges still waiting for you.
            </Text>
            <ScrollView
              style={styles.achievementModalScrollView}
              contentContainerStyle={styles.achievementModalList}
              showsVerticalScrollIndicator={false}
            >
              {dashboardAchievements.map((item) => (
                <View key={item.id} style={styles.achievementModalItem}>
                  <View style={styles.achievementIconBadge}>
                    <Text style={styles.achievementEmoji}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.achievementModalLabel}>
                      {item.label}
                    </Text>
                    <Text style={styles.achievementModalStatus}>
                      {item.earned ? "Unlocked" : "Locked"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.achievementStatusPill,
                      item.earned
                        ? styles.achievementUnlocked
                        : styles.achievementLocked,
                    ]}
                  >
                    <Text style={styles.achievementStatusText}>
                      {item.earned ? "Done" : "Next"}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => setShowAchievementsModal(false)}
            >
              <Text style={styles.modalConfirmText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!!error && (
          <TouchableOpacity onPress={loadDashboardData} style={styles.noEmergencyCard}>
            <Text style={styles.noEmergencyTitle}>Dashboard unavailable</Text>
            <Text style={styles.noEmergencySubtitle}>{error}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Good Morning 👋</Text>
            <Text style={styles.name}>
              {profile.full_name || profile.username || "Donor"}
            </Text>
            <Text style={styles.subtitle}>
              Ready to save someone's life today?
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifButton}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={COLORS.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Profile")}
            >
              <MaterialCommunityIcons name="account" size={26} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {responseSent ? (
          <View style={styles.responseSuccessCard}>
            <Text style={styles.noEmergencyEmoji}>✅</Text>
            <Text style={styles.noEmergencyTitle}>Thanks for helping</Text>
            <Text style={styles.noEmergencySubtitle}>
              You are about {liveDistance} from {activeEmergency?.hospital}.
              Your response has been recorded and the hospital will contact you
              shortly.
            </Text>
            <Text style={styles.liveDistanceHint}>Hospital location</Text>
          </View>
        ) : activeEmergency && activeEmergency.active ? (
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTop}>
              <View style={{ flex: 1 }}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.heroSmall}>Emergency Nearby</Text>
                </View>
                <Text style={styles.heroHospital} numberOfLines={1}>
                  {activeEmergency.hospital}
                </Text>
                <Text style={styles.heroNeed}>Blood Type Needed</Text>
              </View>
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodBadgeText}>
                  {activeEmergency.bloodType}
                </Text>
              </View>
            </View>
            <View style={styles.heroBottom}>
              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaItem}>
                  <Ionicons name="location" size={14} color="white" />
                  <Text style={styles.heroMetaText}>
                    {activeEmergency.distance}
                  </Text>
                </View>
                <View style={styles.heroMetaItem}>
                  <Ionicons name="time-outline" size={14} color="white" />
                  <Text style={styles.heroMetaText}>
                    {activeEmergency.time}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.respondButton}
                activeOpacity={0.85}
                onPress={() => setShowResponseModal(true)}
              >
                <Text style={styles.respondText}>Respond Now</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.noEmergencyCard}>
            <Text style={styles.noEmergencyEmoji}>❤️</Text>
            <Text style={styles.noEmergencyTitle}>No emergency nearby</Text>
            <Text style={styles.noEmergencySubtitle}>
              Thank you for staying ready to help. We'll notify you immediately
              when someone nearby needs your blood type (
              {profile.blood_type || "-"}).
            </Text>
          </View>
        )}

        <View style={styles.donorCard}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.donorCardTitle}>My Donor Card</Text>
              <Text style={styles.memberText}>
                {profile.full_name || profile.username || "Donor"} •{" "}
                {profile.location || "Location not set"}
              </Text>
            </View>
            <View style={styles.bloodTypeCircle}>
              <Text style={styles.bloodType}>{profile.blood_type || "-"}</Text>
            </View>
          </View>
          <View
            style={[
              styles.verifiedContainer,
              profile.verification_status === "pending" &&
                styles.pendingContainer,
            ]}
          >
            <Ionicons
              name={
                profile.verification_status === "pending"
                  ? "time-outline"
                  : "checkmark-circle"
              }
              size={16}
              color={
                profile.verification_status === "pending"
                  ? COLORS.warning
                  : COLORS.success
              }
            />
            <Text
              style={[
                styles.verifiedText,
                profile.verification_status === "pending" && styles.pendingText,
              ]}
            >
              {profile.verification_status === "pending"
                ? "Pending Verification"
                : "Verified Donor"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{donationCount}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{livesSaved}</Text>
              <Text style={styles.statLabel}>Lives Saved</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={styles.iconWrapper}>
                {action.lib === "mci" ? (
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={28}
                    color={COLORS.primary}
                  />
                ) : (
                  <Ionicons
                    name={action.icon}
                    size={28}
                    color={COLORS.primary}
                  />
                )}
              </View>
              <Text style={styles.actionTitle}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity onPress={() => setShowAchievementsModal(true)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsRow}
        >
          {dashboardAchievements.map((item) => (
            <View key={item.id} style={styles.achievementBadge}>
              <Text style={styles.achievementEmoji}>{item.icon}</Text>
              <Text style={styles.achievementLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Recent Activities</Text>
        <View style={{ marginBottom: SPACING.sectionGap }}>
          {recentActivities.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: COLORS.subtitle,
                marginTop: 10,
              }}
            >
              No recent activities yet.
            </Text>
          ) : (
            recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityIconWrapper}>
                  <Ionicons
                    name={activity.icon}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityPlace}>{activity.place}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
                <StatusBadge status={activity.status} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DonorDashboard;

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 40,
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
    fontSize: 30,
    color: COLORS.text,
    marginTop: 2,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    marginTop: SPACING.sectionGap,
    padding: SPACING.cardPadding,
    borderRadius: SPACING.cardRadius,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pulseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "white" },
  heroSmall: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroHospital: {
    marginTop: 8,
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "white",
  },
  heroNeed: {
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  bloodBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  bloodBadgeText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: "white",
  },
  heroBottom: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroMetaRow: { flexDirection: "row", gap: 14 },
  heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroMetaText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "white",
  },
  respondButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: SPACING.buttonRadius,
  },
  respondText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: COLORS.text,
    textAlign: "center",
  },
  modalText: {
    marginTop: 8,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: COLORS.subtitle,
    textAlign: "center",
    lineHeight: 20,
  },
  mapPreviewBox: {
    marginTop: 16,
    width: "100%",
    height: 150,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPreviewGrid: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#EAF7F0",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  mapPinUser: {
    position: "absolute",
    top: 44,
    left: 54,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: "white",
  },
  mapPinHospital: {
    position: "absolute",
    bottom: 38,
    right: 56,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.warning,
    borderWidth: 3,
    borderColor: "white",
  },
  mapLabelUser: {
    position: "absolute",
    top: 64,
    left: 34,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: COLORS.text,
  },
  mapLabelHospital: {
    position: "absolute",
    bottom: 18,
    right: 24,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: COLORS.text,
  },
  routeInfo: { marginTop: 12, alignItems: "center" },
  routeTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: COLORS.text,
  },
  routeSubtitle: {
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },
  modalActions: { marginTop: 20, flexDirection: "row", width: "100%", gap: 12 },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: COLORS.text,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
  },
  modalConfirmText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "white",
  },
  noEmergencyCard: {
    marginTop: SPACING.sectionGap,
    backgroundColor: COLORS.secondary,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding + 4,
    alignItems: "center",
  },
  responseSuccessCard: {
    marginTop: SPACING.sectionGap,
    backgroundColor: "#ECFDF3",
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding + 4,
    alignItems: "center",
  },
  liveDistanceHint: {
    marginTop: 8,
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: COLORS.primary,
  },
  noEmergencyEmoji: { fontSize: 28, marginBottom: 8 },
  noEmergencyTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },
  noEmergencySubtitle: {
    marginTop: 6,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: COLORS.subtitle,
    textAlign: "center",
    lineHeight: 19,
  },
  achievementsModalCard: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: 24,
    maxHeight: "80%",
  },
  achievementModalScrollView: { marginTop: 16, maxHeight: 320 },
  achievementModalList: { gap: 12, paddingBottom: 8 },
  achievementModalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  achievementIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementModalLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: COLORS.text,
  },
  achievementModalStatus: {
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },
  achievementStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  achievementUnlocked: { backgroundColor: "#ECFDF3" },
  achievementLocked: { backgroundColor: "#FDECEC" },
  achievementStatusText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: COLORS.text,
  },
  donorCard: {
    marginTop: SPACING.sectionGap,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  donorCardTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
  },
  memberText: {
    marginTop: 3,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: COLORS.subtitle,
  },
  bloodTypeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodType: { fontFamily: "Poppins_700Bold", fontSize: 20, color: "white" },
  verifiedContainer: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: COLORS.success,
  },
  pendingContainer: { backgroundColor: "#FFF7E6" },
  pendingText: { color: COLORS.warning },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 18 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  statNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: COLORS.primary,
  },
  statLabel: {
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },
  sectionTitle: {
    marginTop: SPACING.sectionGap,
    marginBottom: 16,
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
    paddingVertical: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTitle: {
    marginTop: 12,
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    textAlign: "center",
    color: COLORS.text,
    paddingHorizontal: 6,
  },
  achievementsRow: { gap: 14, paddingRight: 6, paddingBottom: 4 },
  achievementBadge: {
    width: 92,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  achievementEmoji: { fontSize: 26, marginBottom: 8 },
  achievementLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    textAlign: "center",
    color: COLORS.text,
    lineHeight: 15,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activityIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  activityTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: COLORS.text,
  },
  activityPlace: {
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },
  activityDate: {
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
  },
  statusPill: {
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusPillText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: COLORS.success,
  },
});
