import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
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

// ============================================
// DUMMY DATA — swap with real API data later
// ============================================
const DONOR = {
  name: "Melody",
  bloodType: "O+",
  verified: true,
  donationCount: 12,
  livesSaved: 24,
  memberSince: 2024,
};

const EMERGENCY = {
  active: true,
  hospital: "RS Abdul Moeloek",
  bloodType: "O+",
  distance: "2.1 km",
  time: "8 mins ago",
};

const QUICK_ACTIONS = [
  { id: "1", label: "Find Blood Bank", icon: "hospital-building", lib: "mci" },
  { id: "2", label: "Nearby Requests", icon: "map-marker-radius", lib: "mci" },
  {
    id: "3",
    label: "Donation History",
    icon: "document-text-outline",
    lib: "ion",
  },
  { id: "4", label: "Profile", icon: "person-outline", lib: "ion" },
];

const ACHIEVEMENTS = [
  { id: "1", label: "First Donation", icon: "🥉" },
  { id: "2", label: "Life Saver", icon: "❤️" },
  { id: "3", label: "Community Hero", icon: "⭐" },
  { id: "4", label: "10 Donations", icon: "🏅" },
  { id: "5", label: "Regular Donor", icon: "🎖" },
];

const ACTIVITIES = [
  {
    id: "1",
    icon: "water",
    title: "Blood Donation",
    place: "PMI Lampung",
    date: "12 June 2026",
    status: "Completed",
  },
  {
    id: "2",
    icon: "alert-circle",
    title: "Responded to Emergency Request",
    place: "RS Abdul Moeloek",
    date: "Yesterday",
    status: "Completed",
  },
];

// ============================================
// COMPONENT
// ============================================
const DonorDashboard = () => {
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
        {/* ============== HEADER ============== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Good Morning 👋</Text>
            <Text style={styles.name}>{DONOR.name}</Text>
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
              <View style={styles.notifDot} />
            </TouchableOpacity>

            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={26} color="white" />
            </View>
          </View>
        </View>

        {/* ============== SEARCH ============== */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.subtitle} />
          <TextInput
            placeholder="Search hospital, blood bank..."
            placeholderTextColor={COLORS.subtitle}
            style={styles.searchInput}
          />
        </View>

        {/* ============== EMERGENCY HERO CARD ============== */}
        {EMERGENCY.active ? (
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
                  {EMERGENCY.hospital}
                </Text>
                <Text style={styles.heroNeed}>Blood Type Needed</Text>
              </View>

              <View style={styles.bloodBadge}>
                <Text style={styles.bloodBadgeText}>{EMERGENCY.bloodType}</Text>
              </View>
            </View>

            <View style={styles.heroBottom}>
              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaItem}>
                  <Ionicons name="location" size={14} color="white" />
                  <Text style={styles.heroMetaText}>{EMERGENCY.distance}</Text>
                </View>
                <View style={styles.heroMetaItem}>
                  <Ionicons name="time-outline" size={14} color="white" />
                  <Text style={styles.heroMetaText}>{EMERGENCY.time}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.respondButton}
                activeOpacity={0.85}
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
              when someone nearby needs your blood type.
            </Text>
          </View>
        )}

        {/* ============== MY DONOR CARD ============== */}
        <View style={styles.donorCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.donorCardTitle}>My Donor Card</Text>
              <Text style={styles.memberText}>
                Member since {DONOR.memberSince}
              </Text>
            </View>

            <View style={styles.bloodTypeCircle}>
              <Text style={styles.bloodType}>{DONOR.bloodType}</Text>
            </View>
          </View>

          {DONOR.verified && (
            <View style={styles.verifiedContainer}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.success}
              />
              <Text style={styles.verifiedText}>Verified Donor</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{DONOR.donationCount}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{DONOR.livesSaved}</Text>
              <Text style={styles.statLabel}>Lives Saved</Text>
            </View>
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

        {/* ============== ACHIEVEMENTS ============== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsRow}
        >
          {ACHIEVEMENTS.map((item) => (
            <View key={item.id} style={styles.achievementBadge}>
              <Text style={styles.achievementEmoji}>{item.icon}</Text>
              <Text style={styles.achievementLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* ============== RECENT ACTIVITIES ============== */}
        <Text style={styles.sectionTitle}>Recent Activities</Text>

        <View style={{ marginBottom: SPACING.sectionGap }}>
          {ACTIVITIES.map((activity) => (
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

              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{activity.status}</Text>
              </View>
            </View>
          ))}
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

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

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

  // ---------- SEARCH ----------
  searchContainer: {
    marginTop: SPACING.sectionGap,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.inputRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  searchInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.text,
  },

  // ---------- EMERGENCY HERO CARD ----------
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

  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "white",
  },

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

  heroMetaRow: {
    flexDirection: "row",
    gap: 14,
  },

  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

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

  // ---------- NO EMERGENCY STATE ----------
  noEmergencyCard: {
    marginTop: SPACING.sectionGap,
    backgroundColor: COLORS.secondary,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding + 4,
    alignItems: "center",
  },

  noEmergencyEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },

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

  // ---------- DONOR CARD ----------
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

  bloodType: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "white",
  },

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

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },

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

  // ---------- SECTION TITLES ----------
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

  // ---------- ACHIEVEMENTS ----------
  achievementsRow: {
    gap: 14,
    paddingRight: 6,
    paddingBottom: 4,
  },

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

  achievementEmoji: {
    fontSize: 26,
    marginBottom: 8,
  },

  achievementLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    textAlign: "center",
    color: COLORS.text,
    lineHeight: 15,
  },

  // ---------- RECENT ACTIVITIES ----------
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
