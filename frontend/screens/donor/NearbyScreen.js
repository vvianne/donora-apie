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
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS, SPACING } from "../../theme";
import api from "../../services/api";
import { EmptyState, LoadingState } from "../../components/ui";

const NearbyScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    full_name: "",
    location: "",
    blood_type: "",
  });
  const [nearbyData, setNearbyData] = useState({
    hospitals: [],
    blood_banks: [],
    requests: [],
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadNearby);
    const interval = setInterval(loadNearby, 5000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, [navigation]);

  const loadNearby = async () => {
    try {
      setError("");
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/donor/nearby", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data || {};
      setProfile(
        data.profile || { full_name: "", location: "", blood_type: "" },
      );
      setNearbyData({
        hospitals: data.hospitals || [],
        blood_banks: data.blood_banks || [],
        requests: data.requests || [],
      });
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("Unable to load nearby requests. Tap to retry.");
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredRequests = nearbyData.requests.filter((item) =>
    !normalizedSearch ||
    [item.hospital_name, item.location, item.blood_type].some((value) =>
      String(value || "").toLowerCase().includes(normalizedSearch),
    ),
  );

  const handleRespond = async () => {
    if (!selectedRequest) return;

    try {
      setResponding(true);
      const token = await AsyncStorage.getItem("access_token");

      await api.post(
        "/donor/response",
        { blood_request_id: selectedRequest.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert(
        "Response Sent!",
        `Thank you! Your details and location have been sent to ${selectedRequest.hospital_name || "the hospital"}.`,
      );

      setSelectedRequest(null);
      loadNearby();
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to send response.",
      );
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingState]}>
        <LoadingState label="Finding nearby requests…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Nearby</Text>
        <Text style={styles.subtitle}>Find places and requests near you</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.subtitle} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search location or blood type..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!!error && (
          <TouchableOpacity style={styles.emptyState} onPress={loadNearby}>
            <Text style={styles.emptyText}>{error}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.sectionTitle}>Urgent Requests</Text>
        {filteredRequests.length === 0 ? (
          <EmptyState icon="location-outline" title="No nearby emergency requests" message="We’ll show matching requests in your location as soon as they arrive." />
        ) : (
          filteredRequests.map((req) => {
            // FILTER GOLONGAN DARAH DI SINI
            const isBloodMatch = req.blood_type === profile.blood_type;
            const isDisabled = req.responded || !isBloodMatch;

            return (
              <TouchableOpacity
                key={req.id.toString()}
                style={[styles.requestCard, isDisabled && { opacity: 0.6 }]}
                onPress={() => !isDisabled && setSelectedRequest(req)}
                activeOpacity={isDisabled ? 1 : 0.8}
                disabled={isDisabled}
              >
                <View style={styles.requestTop}>
                  <Text style={styles.requestHospital} numberOfLines={1}>
                    {req.hospital_name || "Hospital Emergency"}
                  </Text>
                  <View
                    style={[
                      styles.bloodTypePill,
                      isDisabled && { backgroundColor: "#888888" },
                    ]}
                  >
                    <Text style={styles.bloodTypePillText}>
                      {req.blood_type}
                    </Text>
                  </View>
                </View>
                <View style={styles.requestBottom}>
                  <View style={styles.iconText}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={COLORS.subtitle}
                    />
                    <Text style={styles.requestDistance}>
                      {req.location || "Location not provided"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.respondText,
                      isDisabled && { color: "#888888" },
                    ]}
                  >
                    {req.responded
                      ? "Responded"
                      : !isBloodMatch
                        ? "Not a Match"
                        : "Tap to Respond"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* MODAL RESPOND (Sama seperti sebelumnya) */}
      <Modal
        visible={!!selectedRequest}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={() => setSelectedRequest(null)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Hospital:</Text>
                  <Text style={styles.modalValue}>
                    {selectedRequest.hospital_name}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Blood Type Needed:</Text>
                  <Text style={[styles.modalValue, { color: COLORS.primary }]}>
                    {selectedRequest.blood_type}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Hospital Location:</Text>
                  <Text style={styles.modalValue}>
                    {selectedRequest.location}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Your Blood Type:</Text>
                  <Text style={styles.modalValue}>{profile.blood_type}</Text>
                </View>

                <View style={styles.modalDivider} />

                <Text style={styles.modalDesc}>
                  Your registered location{" "}
                  <Text style={{ fontFamily: "Poppins_600SemiBold" }}>
                    ({profile.location || "Unknown"})
                  </Text>{" "}
                  will be shared with the hospital so they can prioritize nearby
                  donors.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalRespondButton}
              onPress={handleRespond}
              disabled={responding}
            >
              <Text style={styles.modalRespondButtonText}>
                {responding ? "Sending Response..." : "I Want to Donate"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default NearbyScreen;

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingState: { justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 16,
    paddingBottom: 10,
  },
  pageTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 30,
    color: COLORS.text,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
    marginTop: -4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.screenPadding,
    paddingHorizontal: 16,
    borderRadius: SPACING.inputRadius,
    height: 50,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.text,
  },
  content: { paddingHorizontal: SPACING.screenPadding, paddingBottom: 100 },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 6,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 20,
  },
  emptyText: {
    marginTop: 8,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
    textAlign: "center",
  },
  requestCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 6,
    padding: SPACING.cardPadding - 4,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
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
  iconText: { flexDirection: "row", alignItems: "center", gap: 4 },
  requestDistance: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },
  respondText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: COLORS.text,
  },
  modalBody: { marginBottom: 24 },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: COLORS.subtitle,
  },
  modalValue: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: COLORS.text,
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  modalDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
    textAlign: "center",
  },
  modalRespondButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
  },
  modalRespondButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "white",
  },
});
