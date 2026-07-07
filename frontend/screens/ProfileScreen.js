import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS, SPACING } from "../theme";

// ============================================
// DUMMY DATA — one object per role, swap with real API/session data later
// ============================================
const DONOR_DATA = {
  name: "Melody",
  verified: true,
  bloodType: "O+",
  donationCount: 12,
  livesHelped: 24,
  lastDonation: "12 June 2026",
};

const HOSPITAL_DATA = {
  name: "RS Abdul Moeloek",
  address: "Jl. Dr. Rivai No.6, Bandar Lampung",
  emergencyContact: "(0721) 703312",
  requestsCreated: 34,
  requestsCompleted: 29,
};

const BLOODBANK_DATA = {
  name: "PMI Lampung",
  availableUnits: 148,
  criticalTypes: "O-, AB+",
  storageCapacity: "78%",
  operatingHours: "07:00 - 20:00",
};

const TRANSPORT_DATA = {
  unit: "Unit 03",
  vehicleId: "BE 1234 CD",
  driver: "Andi Saputra",
  completedDeliveries: 56,
  currentStatus: "Available",
};

// Shared across every role — comes from the account/session, not the role profile.
const COMMON_INFO = {
  email: "melody@donora.app",
  phone: "+62 812 3456 7890",
  memberSince: "2024",
};

// ============================================
// ROLE CARDS — the only part that changes per role
// ============================================
const DonorCard = ({ data }) => (
  <View style={styles.roleCard}>
    <View style={styles.avatar}>
      <MaterialCommunityIcons name="account" size={32} color="white" />
    </View>

    <Text style={styles.roleName}>{data.name}</Text>

    {data.verified && (
      <View style={styles.verifiedPill}>
        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
        <Text style={styles.verifiedText}>Verified Donor</Text>
      </View>
    )}

    <View style={styles.roleDivider} />

    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.bloodType}</Text>
        <Text style={styles.statLabel}>Blood Type</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.donationCount}</Text>
        <Text style={styles.statLabel}>Donations</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.livesHelped}</Text>
        <Text style={styles.statLabel}>Lives Helped</Text>
      </View>
    </View>

    <View style={styles.roleFooterRow}>
      <Ionicons name="calendar-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.roleFooterText}>
        Last donation: {data.lastDonation}
      </Text>
    </View>
  </View>
);

const HospitalCard = ({ data }) => (
  <View style={styles.roleCard}>
    <View style={styles.avatar}>
      <MaterialCommunityIcons
        name="hospital-building"
        size={32}
        color="white"
      />
    </View>

    <Text style={styles.roleName}>{data.name}</Text>

    <View style={styles.rolePill}>
      <Text style={styles.rolePillText}>Hospital</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="location-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.address}</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="call-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.emergencyContact}</Text>
    </View>

    <View style={styles.roleDivider} />

    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.requestsCreated}</Text>
        <Text style={styles.statLabel}>Requests Created</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.requestsCompleted}</Text>
        <Text style={styles.statLabel}>Requests Completed</Text>
      </View>
    </View>
  </View>
);

const BloodBankCard = ({ data }) => (
  <View style={styles.roleCard}>
    <View style={styles.avatar}>
      <MaterialCommunityIcons name="water" size={32} color="white" />
    </View>

    <Text style={styles.roleName}>{data.name}</Text>

    <View style={styles.rolePill}>
      <Text style={styles.rolePillText}>Blood Bank</Text>
    </View>

    <View style={styles.roleDivider} />

    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.availableUnits}</Text>
        <Text style={styles.statLabel}>Available Units</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.storageCapacity}</Text>
        <Text style={styles.statLabel}>Storage Used</Text>
      </View>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="alert-circle-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>Critical types: {data.criticalTypes}</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="time-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.operatingHours}</Text>
    </View>
  </View>
);

const TransportCard = ({ data }) => (
  <View style={styles.roleCard}>
    <View style={styles.avatar}>
      <MaterialCommunityIcons name="truck-fast" size={32} color="white" />
    </View>

    <Text style={styles.roleName}>{data.unit}</Text>

    <View style={styles.rolePill}>
      <Text style={styles.rolePillText}>Transportation</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="car-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.vehicleId}</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="person-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.driver}</Text>
    </View>

    <View style={styles.roleDivider} />

    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.completedDeliveries}</Text>
        <Text style={styles.statLabel}>Completed Deliveries</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text
          style={[styles.statValue, { color: COLORS.success, fontSize: 16 }]}
        >
          {data.currentStatus}
        </Text>
        <Text style={styles.statLabel}>Current Status</Text>
      </View>
    </View>
  </View>
);

// Picks the right card for the given role. Add a new role here later
// without ever touching Personal Information / Settings / Support / Logout.
const RoleCard = ({ role }) => {
  switch (role) {
    case "hospital":
      return <HospitalCard data={HOSPITAL_DATA} />;
    case "bloodbank":
      return <BloodBankCard data={BLOODBANK_DATA} />;
    case "transportation":
      return <TransportCard data={TRANSPORT_DATA} />;
    case "donor":
    default:
      return <DonorCard data={DONOR_DATA} />;
  }
};

// ============================================
// SHARED SECTIONS — identical for every role
// ============================================
const SettingsRow = ({ icon, label, danger }) => (
  <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
    <View style={styles.settingsRowLeft}>
      <View
        style={[
          styles.settingsIconWrapper,
          danger && { backgroundColor: "#FFECEC" },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={danger ? COLORS.primary : COLORS.text}
        />
      </View>
      <Text style={[styles.settingsLabel, danger && { color: COLORS.primary }]}>
        {label}
      </Text>
    </View>

    {!danger && (
      <Ionicons name="chevron-forward" size={18} color={COLORS.subtitle} />
    )}
  </TouchableOpacity>
);

// ============================================
// COMPONENT
// ============================================
const ProfileScreen = () => {
  const role = "donor";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============== HEADER ============== */}
        <Text style={styles.pageTitle}>Profile</Text>

        {/* ============== ROLE-SPECIFIC CARD ============== */}
        <RoleCard role={role} />

        {/* ============== PERSONAL INFORMATION ============== */}
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoCardRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.subtitle} />
            <Text style={styles.infoCardText}>{COMMON_INFO.email}</Text>
          </View>

          <View style={styles.infoCardDivider} />

          <View style={styles.infoCardRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.subtitle} />
            <Text style={styles.infoCardText}>{COMMON_INFO.phone}</Text>
          </View>

          <View style={styles.infoCardDivider} />

          <View style={styles.infoCardRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={COLORS.subtitle}
            />
            <Text style={styles.infoCardText}>
              Member since {COMMON_INFO.memberSince}
            </Text>
          </View>
        </View>

        {/* ============== ACCOUNT SETTINGS ============== */}
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <View style={styles.settingsCard}>
          <SettingsRow icon="person-outline" label="Edit Profile" />
          <View style={styles.settingsDivider} />
          <SettingsRow icon="notifications-outline" label="Notifications" />
          <View style={styles.settingsDivider} />
          <SettingsRow icon="lock-closed-outline" label="Privacy & Security" />
        </View>

        {/* ============== SUPPORT ============== */}
        <Text style={styles.sectionTitle}>Support</Text>

        <View style={styles.settingsCard}>
          <SettingsRow icon="help-circle-outline" label="Help Center" />
          <View style={styles.settingsDivider} />
          <SettingsRow icon="chatbubble-ellipses-outline" label="Contact Us" />
        </View>

        {/* ============== LOGOUT ============== */}
        <View
          style={[styles.settingsCard, { marginBottom: SPACING.sectionGap }]}
        >
          <SettingsRow icon="log-out-outline" label="Logout" danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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

  pageTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 30,
    color: COLORS.text,
    marginBottom: 16,
  },

  // ---------- ROLE CARD (shared shell for all 4 variants) ----------
  roleCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding + 4,
    alignItems: "center",
    marginBottom: SPACING.sectionGap,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  roleName: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: COLORS.text,
    textAlign: "center",
  },

  verifiedPill: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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

  rolePill: {
    marginTop: 8,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  rolePillText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: COLORS.primary,
  },

  infoRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  infoText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
    textAlign: "center",
  },

  roleDivider: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },

  roleFooterRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  roleFooterText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-around",
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

  statValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: COLORS.primary,
  },

  statLabel: {
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
    textAlign: "center",
  },

  // ---------- SECTION TITLE ----------
  sectionTitle: {
    marginBottom: 14,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },

  // ---------- PERSONAL INFORMATION ----------
  infoCard: {
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

  infoCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },

  infoCardText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: COLORS.text,
  },

  infoCardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },

  // ---------- SETTINGS / SUPPORT / LOGOUT CARD ----------
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 4,
    paddingHorizontal: SPACING.cardPadding - 4,
    marginBottom: SPACING.sectionGap,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  settingsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  settingsLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: COLORS.text,
  },

  settingsDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
