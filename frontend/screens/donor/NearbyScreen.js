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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS, SPACING } from "../../theme";

// ============================================
// DUMMY DATA — swap with real API data later
// ============================================
const BLOOD_BANKS = [
  { id: "1", name: "Blood Bank 1", distance: "1.2 km" },
  { id: "2", name: "Blood Bank 2", distance: "3.4 km" },
];

const HOSPITALS = [
  { id: "1", name: "Hospital 1", distance: "2.1 km" },
  { id: "2", name: "Hospital 2", distance: "2.8 km" },
];

const ACTIVE_REQUESTS = [
  {
    id: "1",
    hospital: "Hospital 1",
    bloodType: "O+",
    distance: "2.1 km",
  },
];

const NearbyScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============== TITLE ============== */}
        <Text style={styles.pageTitle}>Nearby</Text>

        {/* ============== SEARCH BAR ============== */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.subtitle} />
          <TextInput
            placeholder="Search location..."
            placeholderTextColor={COLORS.subtitle}
            style={styles.searchInput}
          />
        </View>

        {/* ============== MAP PREVIEW ============== */}
        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={36} color={COLORS.primary} />
            <Text style={styles.mapPlaceholderText}>Map Preview</Text>
          </View>

          <View style={styles.mapLegendRow}>
            <View style={styles.legendItem}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.legendText}>Current Location</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: COLORS.primary }]}
              />
              <Text style={styles.legendText}>Blood Banks</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: COLORS.warning }]}
              />
              <Text style={styles.legendText}>Hospitals</Text>
            </View>
          </View>
        </View>

        {/* ============== NEARBY BLOOD BANKS ============== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🩸</Text>
          <Text style={styles.sectionTitle}>Blood Banks</Text>
        </View>

        <View style={{ marginBottom: SPACING.sectionGap }}>
          {BLOOD_BANKS.map((item) => (
            <View key={item.id} style={styles.listCard}>
              <View style={styles.listIconWrapper}>
                <MaterialCommunityIcons
                  name="hospital-building"
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{item.name}</Text>
                <View style={styles.distanceRow}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={COLORS.subtitle}
                  />
                  <Text style={styles.listDistance}>{item.distance}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.viewButton} activeOpacity={0.8}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ============== NEARBY HOSPITALS ============== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🏥</Text>
          <Text style={styles.sectionTitle}>Hospitals</Text>
        </View>

        <View style={{ marginBottom: SPACING.sectionGap }}>
          {HOSPITALS.map((item) => (
            <View key={item.id} style={styles.listCard}>
              <View style={styles.listIconWrapper}>
                <Ionicons
                  name="medkit-outline"
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{item.name}</Text>
                <View style={styles.distanceRow}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={COLORS.subtitle}
                  />
                  <Text style={styles.listDistance}>{item.distance}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.viewButton} activeOpacity={0.8}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ============== ACTIVE BLOOD REQUESTS ============== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🚨</Text>
          <Text style={styles.sectionTitle}>Active Requests</Text>
        </View>

        <View style={{ marginBottom: SPACING.sectionGap }}>
          {ACTIVE_REQUESTS.map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <View style={styles.requestTop}>
                <Text style={styles.requestHospital} numberOfLines={1}>
                  {item.hospital}
                </Text>

                <View style={styles.bloodTypePill}>
                  <Text style={styles.bloodTypePillText}>{item.bloodType}</Text>
                </View>
              </View>

              <View style={styles.requestBottom}>
                <View style={styles.distanceRow}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={COLORS.subtitle}
                  />
                  <Text style={styles.requestDistance}>{item.distance}</Text>
                </View>

                <TouchableOpacity
                  style={styles.respondButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.respondButtonText}>Respond</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NearbyScreen;

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
    marginBottom: SPACING.sectionGap,
  },

  // ---------- SEARCH BAR ----------
  searchContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.inputRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sectionGap,
  },

  searchInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.text,
  },

  // ---------- MAP PREVIEW ----------
  mapCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  mapPlaceholder: {
    height: 160,
    borderRadius: SPACING.cardRadius - 6,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  mapPlaceholderText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: COLORS.primary,
  },

  mapLegendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
  },

  // ---------- SECTION HEADER ----------
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  sectionIcon: {
    fontSize: 18,
  },

  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
  },

  // ---------- LIST CARD (Blood Banks / Hospitals) ----------
  listCard: {
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

  listIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  listTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: COLORS.text,
  },

  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },

  listDistance: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },

  viewButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: SPACING.buttonRadius,
  },

  viewButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: COLORS.primary,
  },

  // ---------- ACTIVE REQUEST CARD ----------
  requestCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 4,
    padding: SPACING.cardPadding - 4,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  requestTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  requestHospital: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: COLORS.text,
    marginRight: 10,
  },

  bloodTypePill: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  bloodTypePillText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
    color: "white",
  },

  requestBottom: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  requestDistance: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },

  respondButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: SPACING.buttonRadius,
  },

  respondButtonText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    color: "white",
  },
});
