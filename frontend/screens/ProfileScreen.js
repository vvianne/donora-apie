import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Pressable,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS, SPACING } from "../theme";
import api from "../services/api";
import { LoadingState } from "../components/ui";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ============================================
// PROFILE DATA — loaded from backend
// ============================================
const DEFAULT_PROFILE = {
  username: "",
  role: "donor",
  full_name: "",
  phone: "",
  blood_type: "",
  location: "",
  verification_status: "verified",
};

// ============================================
// ROLE CARDS — the only part that changes per role
// ============================================
const DonorCard = ({ data }) => {
  const isPending = data.verification_status === "pending";

  return (
    <View style={styles.roleCard}>
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="account" size={32} color="white" />
      </View>

      <Text style={styles.roleName}>{data.full_name || data.username}</Text>

      <View style={[styles.verifiedPill, isPending && styles.pendingPill]}>
        <Ionicons
          name={isPending ? "time-outline" : "checkmark-circle"}
          size={14}
          color={isPending ? COLORS.warning : COLORS.success}
        />
        <Text style={[styles.verifiedText, isPending && styles.pendingText]}>
          {isPending ? "Pending Verification" : "Verified Donor"}
        </Text>
      </View>

      <View style={styles.roleDivider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.blood_type || "-"}</Text>
          <Text style={styles.statLabel}>Blood Type</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.role_details?.completed_donations || 0}</Text>
          <Text style={styles.statLabel}>Donations</Text>
        </View>
      </View>

      <View style={styles.roleFooterRow}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.subtitle} />
        <Text style={styles.roleFooterText}>Role: {data.role}</Text>
      </View>
    </View>
  );
};

const HospitalCard = ({ data }) => (
  <View style={styles.roleCard}>
    <View style={styles.avatar}>
      <MaterialCommunityIcons
        name="hospital-building"
        size={32}
        color="white"
      />
    </View>

    <Text style={styles.roleName}>{data.full_name || data.username}</Text>

    <View style={styles.rolePill}>
      <Text style={styles.rolePillText}>Hospital</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="location-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.location || "No location yet"}</Text>
    </View>

    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.role_details?.active_requests || 0}</Text>
        <Text style={styles.statLabel}>Active Requests</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{data.role_details?.completed_requests || 0}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="call-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.phone || "No phone yet"}</Text>
    </View>
  </View>
);

const BloodBankCard = ({ data }) => (
  <View style={styles.roleCard}>
    <View style={styles.avatar}>
      <MaterialCommunityIcons name="water" size={32} color="white" />
    </View>

    <Text style={styles.roleName}>{data.full_name || data.username}</Text>

    <View style={styles.rolePill}>
      <Text style={styles.rolePillText}>Blood Bank</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="location-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.location || "No location yet"}</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="call-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.phone || "No phone yet"}</Text>
    </View>
  </View>
);

const TransportCard = ({ data }) => (
  <View style={styles.roleCard}>
    <View style={styles.avatar}>
      <MaterialCommunityIcons name="truck-fast" size={32} color="white" />
    </View>

    <Text style={styles.roleName}>{data.full_name || data.username}</Text>

    <View style={styles.rolePill}>
      <Text style={styles.rolePillText}>Transportation</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="location-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.location || "No location yet"}</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="call-outline" size={14} color={COLORS.subtitle} />
      <Text style={styles.infoText}>{data.phone || "No phone yet"}</Text>
    </View>
  </View>
);

// Picks the right card for the given role. Add a new role here later
// without ever touching Personal Information / Settings / Support / Logout.
const RoleCard = ({ role, data }) => {
  switch (role) {
    case "hospital":
      return <HospitalCard data={data} />;
    case "blood_bank":
      return <BloodBankCard data={data} />;
    case "transportation":
      return <TransportCard data={data} />;
    case "donor":
    default:
      return <DonorCard data={data} />;
  }
};

// ============================================
// SHARED SECTIONS — identical for every role
// ============================================
const SettingsRow = ({ icon, label, danger, onPress }) => (
  <TouchableOpacity
    style={styles.settingsRow}
    activeOpacity={0.7}
    onPress={onPress}
  >
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
const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    bloodType: "",
    location: "",
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyEnabled, setPrivacyEnabled] = useState(true);

  const role = profile.role || "donor";

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = response.data?.data || {};
      setProfile(profileData);
      setProfileForm({
        fullName: profileData.full_name || "",
        phone: profileData.phone || "",
        bloodType: profileData.blood_type || "",
        location: profileData.location || "",
      });
    } catch (error) {
      console.log("Profile load failed", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadProfile);
    return unsubscribe;
  }, [navigation]);

  const saveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        return;
      }

      const response = await api.put(
        "/auth/profile",
        {
          full_name: profileForm.fullName,
          phone: profileForm.phone,
          blood_type: profileForm.bloodType,
          location: profileForm.location,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const updatedProfile = response.data?.data || {};
      setProfile(updatedProfile);
      setProfileForm({
        fullName: updatedProfile.full_name || "",
        phone: updatedProfile.phone || "",
        bloodType: updatedProfile.blood_type || "",
        location: updatedProfile.location || "",
      });
      closeModal();
    } catch (error) {
      console.log(
        "Profile update failed",
        error.response?.data || error.message,
      );
    }
  };

  const openModal = (type) => {
    setActiveModal(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setActiveModal(null);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("access_token");
    } catch (error) {
      console.log("Logout failed", error);
    } finally {
      closeModal();
      navigation?.navigate("Login");
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case "editProfile":
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalSubtitle}>
              Update your identity details. Blood type changes require
              verification.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={profileForm.fullName}
              onChangeText={(value) =>
                setProfileForm((prev) => ({ ...prev, fullName: value }))
              }
              placeholder="Full Name"
            />

            <TextInput
              style={styles.modalInput}
              value={profileForm.phone}
              onChangeText={(value) =>
                setProfileForm((prev) => ({ ...prev, phone: value }))
              }
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />

            {role === "donor" && <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={profileForm.bloodType}
                onValueChange={(value) =>
                  setProfileForm((prev) => ({ ...prev, bloodType: value }))
                }
                style={styles.picker}
                dropdownIconColor={COLORS.text}
              >
                <Picker.Item label="Select blood type" value="" />
                {BLOOD_TYPES.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>}

            <TextInput
              style={styles.modalInput}
              value={profileForm.location}
              onChangeText={(value) =>
                setProfileForm((prev) => ({ ...prev, location: value }))
              }
              placeholder="Location"
            />

            <View style={styles.verificationBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.verificationText}>
                Status:{" "}
                {profile.verification_status === "pending"
                  ? "Pending Verification"
                  : "Verified"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={saveProfile}
            >
              <Text style={styles.primaryButtonText}>
                Submit for Verification
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "notifications":
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <Text style={styles.modalSubtitle}>
              Control how you receive updates from Donora.
            </Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Emergency Alerts</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D0D5DD", true: COLORS.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Donation Reminders</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D0D5DD", true: COLORS.primary }}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={closeModal}>
              <Text style={styles.primaryButtonText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        );

      case "privacy":
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy & Security</Text>
            <Text style={styles.modalSubtitle}>
              Manage your privacy settings and account security.
            </Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Private Profile</Text>
              <Switch
                value={privacyEnabled}
                onValueChange={setPrivacyEnabled}
                trackColor={{ false: "#D0D5DD", true: COLORS.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Two-Factor Authentication</Text>
              <Switch
                value={privacyEnabled}
                onValueChange={setPrivacyEnabled}
                trackColor={{ false: "#D0D5DD", true: COLORS.primary }}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={closeModal}>
              <Text style={styles.primaryButtonText}>Update Security</Text>
            </TouchableOpacity>
          </View>
        );

      case "help":
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Help Center</Text>
            <Text style={styles.modalSubtitle}>
              Need assistance? Our support team can help with profile updates,
              verification, and account access.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={closeModal}>
              <Text style={styles.primaryButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        );

      case "contact":
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contact Us</Text>
            <Text style={styles.modalSubtitle}>
              Email: support@donora.app
              {"\n"}Phone: +62 812 3456 7890
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={closeModal}>
              <Text style={styles.primaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        );

      case "logout":
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to sign out from Donora?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={closeModal}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogout}
              >
                <Text style={styles.primaryButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============== HEADER ============== */}
        <Text style={styles.pageTitle}>
          {role === "hospital" ? "Hospital Profile" : role === "donor" ? "Donor Profile" : "Profile"}
        </Text>

        {/* ============== ROLE-SPECIFIC CARD ============== */}
        {loading ? (
          <LoadingState label="Loading your profile…" />
        ) : (
          <RoleCard role={role} data={profile} />
        )}

        {/* ============== PERSONAL INFORMATION ============== */}
        <Text style={styles.sectionTitle}>
          {role === "hospital" ? "Hospital Information" : "Personal Information"}
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoCardRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.subtitle} />
            <Text style={styles.infoCardText}>
              {role === "hospital" ? `Account: ${profile.username || "-"}` : profile.username || "No username"}
            </Text>
          </View>

          <View style={styles.infoCardDivider} />

          <View style={styles.infoCardRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.subtitle} />
            <Text style={styles.infoCardText}>
              {profile.phone || "No phone"}
            </Text>
          </View>

          <View style={styles.infoCardDivider} />

          <View style={styles.infoCardRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={COLORS.subtitle}
            />
            <Text style={styles.infoCardText}>
              {role === "donor"
                ? `Eligibility: ${profile.role_details?.eligibility_status || "unknown"}`
                : role === "hospital"
                  ? `Total emergency requests: ${profile.role_details?.total_requests || 0}`
                  : `Verification: ${profile.verification_status || "verified"}`}
            </Text>
          </View>
        </View>

        {/* ============== ACCOUNT SETTINGS ============== */}
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <View style={styles.settingsCard}>
          <SettingsRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => openModal("editProfile")}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => openModal("notifications")}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="lock-closed-outline"
            label="Privacy & Security"
            onPress={() => openModal("privacy")}
          />
        </View>

        {/* ============== SUPPORT ============== */}
        <Text style={styles.sectionTitle}>Support</Text>

        <View style={styles.settingsCard}>
          <SettingsRow
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => openModal("help")}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="chatbubble-ellipses-outline"
            label="Contact Us"
            onPress={() => openModal("contact")}
          />
        </View>

        {/* ============== LOGOUT ============== */}
        <View
          style={[styles.settingsCard, { marginBottom: SPACING.sectionGap }]}
        >
          <SettingsRow
            icon="log-out-outline"
            label="Logout"
            danger
            onPress={() => openModal("logout")}
          />
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            {renderModalContent()}
          </Pressable>
        </Pressable>
      </Modal>
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

  pendingPill: {
    backgroundColor: "#FFF7E6",
  },

  pendingText: {
    color: COLORS.warning,
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

  loadingBox: {
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    marginBottom: SPACING.sectionGap,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-end",
  },

  modalBox: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },

  modalContent: {
    gap: 12,
  },

  modalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: COLORS.text,
  },

  modalSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: COLORS.subtitle,
    lineHeight: 20,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Poppins_400Regular",
    color: COLORS.text,
  },

  verificationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  verificationText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: COLORS.primary,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },

  switchLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: COLORS.text,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 4,
  },

  primaryButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
    fontSize: 14,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.text,
    fontSize: 14,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
