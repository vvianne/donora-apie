import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS, SPACING } from "../../theme";
import api from "../../services/api";

const NearbyScreen = () => {
  const [profile, setProfile] = useState({ full_name: "", location: "" });
  const [nearbyData, setNearbyData] = useState({
    hospitals: [],
    blood_banks: [],
    requests: [],
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNearby = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get("/donor/nearby", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data?.data || {};
        setProfile(data.profile || { full_name: "", location: "" });
        setNearbyData({
          hospitals: data.hospitals || [],
          blood_banks: data.blood_banks || [],
          requests: data.requests || [],
        });
      } catch (error) {
        console.log(
          "Nearby load failed",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    loadNearby();
  }, []);

  const filteredHospitals = (nearbyData.hospitals || []).filter((item) =>
    `${item.name} ${item.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const filteredBloodBanks = (nearbyData.blood_banks || []).filter((item) =>
    `${item.name} ${item.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const filteredRequests = (nearbyData.requests || []).filter((item) =>
    `${item.hospital_name} ${item.blood_type} ${item.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Nearby</Text>
        <Text style={styles.pageSubtitle}>
          {profile.full_name || "Donor"} •{" "}
          {profile.location || "Location not set"}
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.subtitle} />
          <TextInput
            placeholder="Search location or facility..."
            placeholderTextColor={COLORS.subtitle}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={36} color={COLORS.primary} />
            <Text style={styles.mapPlaceholderText}>Nearby resources</Text>
          </View>

          <View style={styles.mapLegendRow}>
            <View style={styles.legendItem}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.legendText}>Your location</Text>
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

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🩸</Text>
          <Text style={styles.sectionTitle}>Blood Banks</Text>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={{ marginBottom: SPACING.sectionGap }}>
            {filteredBloodBanks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No blood banks available right now.
                </Text>
              </View>
            ) : (
              filteredBloodBanks.map((item) => (
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
                      <Text style={styles.listDistance}>
                        {item.location || "Location not set"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🏥</Text>
          <Text style={styles.sectionTitle}>Hospitals</Text>
        </View>

        <View style={{ marginBottom: SPACING.sectionGap }}>
          {filteredHospitals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No hospitals available right now.
              </Text>
            </View>
          ) : (
            filteredHospitals.map((item) => (
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
                    <Text style={styles.listDistance}>
                      {item.location || "Location not set"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🚨</Text>
          <Text style={styles.sectionTitle}>Active Requests</Text>
        </View>

        <View style={{ marginBottom: SPACING.sectionGap }}>
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No active requests right now.
              </Text>
            </View>
          ) : (
            filteredRequests.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <Text style={styles.requestHospital} numberOfLines={1}>
                    {item.hospital_name}
                  </Text>
                  <View style={styles.bloodTypePill}>
                    <Text style={styles.bloodTypePillText}>
                      {item.blood_type}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestBottom}>
                  <View style={styles.distanceRow}>
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={COLORS.subtitle}
                    />
                    <Text style={styles.requestDistance}>
                      {item.location || "Location not set"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.respondButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.respondButtonText}>Respond</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
    marginBottom: 6,
  },

  pageSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: COLORS.subtitle,
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

  loadingState: {
    paddingVertical: 24,
    alignItems: "center",
  },

  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
  },

  emptyStateText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: COLORS.subtitle,
    textAlign: "center",
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
