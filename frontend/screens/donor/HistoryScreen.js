import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS, SPACING } from "../../theme";
import api from "../../services/api";
import { EmptyState, LoadingState, StatusBadge } from "../../components/ui";

const DEFAULT_PROFILE = {
  username: "",
  role: "donor",
  full_name: "",
  blood_type: "",
  location: "",
};

const HistoryScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          setLoading(false);
          return;
        }

        const [profileRes, historyRes] = await Promise.all([
          api.get("/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/donor/donation_history", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProfile(profileRes.data?.data || DEFAULT_PROFILE);
        setDonations(
          Array.isArray(historyRes.data?.data) ? historyRes.data.data : [],
        );
      } catch (error) {
        console.log(
          "History load failed",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation]);

  const summary = {
    totalDonations: donations.length,
    livesHelped: donations.length,
    lastDonation: donations[0]?.donation_date || "No donation yet",
  };

  const achievements = [
    {
      id: "1",
      label: "First Donation",
      icon: "🥉",
      earned: donations.length >= 1,
    },
    { id: "2", label: "Life Saver", icon: "❤️", earned: donations.length >= 1 },
    {
      id: "3",
      label: "5 Donations",
      icon: "🏅",
      earned: donations.length >= 5,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="document-text" size={22} color={COLORS.primary} />
            <Text style={styles.pageTitle}>History</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {profile.full_name || profile.username || "Donor"} •{" "}
            {profile.location || "Location not set"}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryIconWrapper}>
              <Ionicons name="water" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.summaryNumber}>{summary.totalDonations}</Text>
            <Text style={styles.summaryLabel}>Total Donations</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={styles.summaryIconWrapper}>
              <Ionicons name="heart" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.summaryNumber}>{summary.livesHelped}</Text>
            <Text style={styles.summaryLabel}>Lives Helped</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={styles.summaryIconWrapper}>
              <Ionicons name="calendar" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.summaryDate}>{summary.lastDonation}</Text>
            <Text style={styles.summaryLabel}>Last Donation</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Donation History</Text>

        {loading ? (
          <LoadingState label="Loading donation history…" />
        ) : donations.length === 0 ? (
          <EmptyState icon="heart-outline" title="No donation history yet" message="Your first donation can make a meaningful difference." />
        ) : (
          <View style={{ marginBottom: SPACING.sectionGap }}>
            {donations.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyIconWrapper}>
                  <Ionicons name="water" size={20} color={COLORS.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.historyTopRow}>
                    <Text style={styles.historyTitle}>Blood Donation</Text>
                    <View style={styles.bloodTypePill}>
                      <Text style={styles.bloodTypePillText}>
                        {item.blood_type || profile.blood_type || "-"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.historyPlace}>
                    {item.hospital_name ||
                      item.place ||
                      item.location ||
                      profile.location ||
                      "Recorded donation"}
                  </Text>
                  <Text style={styles.historyDate}>
                    {item.donation_date || "Unknown date"}
                  </Text>
                </View>

                <StatusBadge status={item.status || "completed"} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🏆</Text>
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>

        <View style={styles.achievementsRow}>
          {achievements.map((item) => (
            <View
              key={item.id}
              style={[
                styles.achievementBadge,
                !item.earned && styles.achievementLocked,
              ]}
            >
              <Text style={styles.achievementEmoji}>{item.icon}</Text>
              <Text style={styles.achievementLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryScreen;

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
    paddingTop: 16,
    paddingBottom: 40,
  },

  // ---------- HEADER ----------
  header: {
    marginBottom: SPACING.sectionGap,
  },

  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  pageTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 30,
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 4,
    marginLeft: 30,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
  },

  // ---------- DONATION SUMMARY ----------
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    paddingVertical: SPACING.cardPadding + 4,
    paddingHorizontal: SPACING.cardPadding - 4,
    marginBottom: SPACING.sectionGap,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryDivider: {
    width: 1,
    height: 56,
    backgroundColor: COLORS.border,
  },

  summaryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  summaryNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: COLORS.text,
  },

  summaryDate: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: COLORS.text,
    textAlign: "center",
  },

  summaryLabel: {
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
    textAlign: "center",
  },

  // ---------- SECTION TITLES ----------
  sectionTitle: {
    marginBottom: 16,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  sectionIcon: {
    fontSize: 18,
  },

  // ---------- DONATION HISTORY CARD ----------
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 6,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    minHeight: 92,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  historyIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  historyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  historyTitle: {
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
    fontSize: 11,
    color: "white",
  },

  historyPlace: {
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },

  historyDate: {
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
    alignSelf: "flex-start",
  },

  statusPillText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: COLORS.success,
  },

  // ---------- ACHIEVEMENTS ----------
  achievementsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  achievementBadge: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.7,
  },

  loadingState: {
    paddingVertical: 24,
    alignItems: "center",
  },

  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: 24,
    alignItems: "center",
    marginBottom: SPACING.sectionGap,
  },

  emptyStateText: {
    marginTop: 8,
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: COLORS.subtitle,
    textAlign: "center",
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
});
