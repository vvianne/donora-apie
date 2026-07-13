import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { COLORS, SPACING } from "../theme";
import api from "../services/api";
import { EmptyState, StatusBadge } from "../components/ui";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const normalizeStatus = (status) => {
  const value = (status || "").toLowerCase();
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown";
};

const STATUS_STYLES = {
  Pending: { bg: "#FFF4E5", text: COLORS.warning },
  Approved: { bg: "#EFF4FF", text: "#3B82F6" },
  Verified: { bg: "#E0F2FE", text: "#0284C7" },
  Completed: { bg: "#ECFDF3", text: COLORS.success },
  Accepted: { bg: "#EFF4FF", text: "#3B82F6" },
  Transporting: { bg: "#E0F2FE", text: "#0284C7" },
  Cancelled: { bg: "#F2F4F7", text: COLORS.subtitle },
  Rejected: { bg: "#FFECEC", text: COLORS.primary },
};

const RequestCard = ({ item, onView }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.bloodIconWrapper}>
          <Ionicons name="water" size={20} color={COLORS.primary} />
        </View>

        <View>
          <Text style={styles.bloodType}>{item.blood_type}</Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status : </Text>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        activeOpacity={0.8}
        onPress={() => onView(item)}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );
};

const RequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    blood_type: "O+",
    quantity: "1",
  });
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  // State baru khusus untuk mengontrol pop-up Modal dalam aplikasi
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchRequests();
    const unsubscribe = navigation.addListener("focus", fetchRequests);
    const interval = setInterval(fetchRequests, 5000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, [navigation]);

  const fetchRequests = async () => {
    try {
      setError("");
      const token = await AsyncStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const profileResponse = await api.get("/auth/profile", { headers });
      const authenticatedRole = String(
        profileResponse.data?.data?.role || "",
      ).toLowerCase();
      const endpoint =
        authenticatedRole === "blood_bank"
          ? "/blood_bank/requests"
          : "/hospital/request";
      const response = await api.get(endpoint, { headers });

      setRole(authenticatedRole);
      const normalizedRequests = (response.data.data || []).map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      }));
      setRequests(normalizedRequests);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setRequests([]);
      setError(err.response?.data?.message || "Could not load requests.");
    }
  };

  const handleCreateRequest = async () => {
    if (loading || role !== "hospital") return;

    if (!form.blood_type || !form.quantity) {
      Alert.alert(
        "Missing details",
        "Please fill in the blood type and quantity.",
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
          status: "Pending",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setForm({ blood_type: "O+", quantity: "1" });
      await fetchRequests();
      Alert.alert("Success", "Emergency request created.");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not create request.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (item) => {
    // Membuka modal kustom di dalam aplikasi alih-alih Alert bawaan
    setSelectedRequest(item);
  };

  const updateResponseStatus = async (responseId, status) => {
    if (role !== "hospital") return;

    try {
      const token = await AsyncStorage.getItem("access_token");
      await api.patch(
        `/hospital/response/${responseId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Unable to update status.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>
          {role === "blood_bank" ? "Incoming Requests" : "Requests"}
        </Text>
      </View>

      {role === "hospital" && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create Emergency Request</Text>
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
      )}

      {!!error ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Requests unavailable"
          message={error}
        />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="clipboard-outline"
          title={
            role === "blood_bank" ? "No incoming requests" : "No requests yet"
          }
          message={
            role === "blood_bank"
              ? "New hospital blood requests will appear here."
              : "Create your first emergency request when blood is needed."
          }
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RequestCard item={item} onView={handleViewRequest} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* CUSTOM IN-APP MODAL UNTUK VIEW */}
      <Modal
        visible={!!selectedRequest}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Info</Text>
              <TouchableOpacity onPress={() => setSelectedRequest(null)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Blood Type:</Text>
                  <Text style={styles.modalValue}>
                    {selectedRequest.blood_type}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status:</Text>
                  <StatusBadge status={selectedRequest.status} />
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Quantity:</Text>
                  <Text style={styles.modalValue}>
                    {selectedRequest.quantity || "N/A"} Bags
                  </Text>
                </View>

                {role === "hospital" && (
                  <>
                    <View style={styles.modalDivider} />
                    <Text style={styles.modalDesc}>Donor responses</Text>
                    {(selectedRequest.responses || []).length === 0 ? (
                      <Text style={styles.modalDesc}>
                        No donor has responded yet.
                      </Text>
                    ) : (
                      selectedRequest.responses.map((response) => (
                        <View key={response.id} style={styles.modalRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.modalValue}>
                              {response.donor_name}
                            </Text>
                            <Text style={styles.modalLabel}>
                              {response.blood_type || "-"}
                            </Text>
                            <StatusBadge status={response.status} />
                          </View>
                          {String(response.status).toLowerCase() ===
                            "pending" && (
                            <View>
                              <TouchableOpacity
                                onPress={() =>
                                  updateResponseStatus(response.id, "approved")
                                }
                              >
                                <Text style={styles.modalConnectButtonText}>
                                  Approve
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  updateResponseStatus(response.id, "rejected")
                                }
                              >
                                <Text
                                  style={[
                                    styles.modalConnectButtonText,
                                    { color: COLORS.primary },
                                  ]}
                                >
                                  Reject
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                          {["approved", "transporting"].includes(
                            String(response.status).toLowerCase(),
                          ) && (
                            <TouchableOpacity
                              onPress={() =>
                                updateResponseStatus(response.id, "completed")
                              }
                            >
                              <Text style={styles.modalConnectButtonText}>
                                Mark Completed
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))
                    )}
                  </>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.modalConnectButton} onPress={() => setSelectedRequest(null)}>
              <Text style={styles.modalConnectButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RequestsScreen;

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 16,
    paddingBottom: SPACING.sectionGap,
  },

  pageTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 30,
    color: COLORS.text,
  },

  listContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: 40,
  },

  formCard: {
    marginHorizontal: SPACING.screenPadding,
    marginBottom: 16,
    padding: SPACING.cardPadding - 4,
    borderRadius: SPACING.cardRadius - 6,
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  formTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontFamily: "Poppins_500Medium",
    color: COLORS.text,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.inputRadius,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "white",
  },

  picker: {
    color: COLORS.text,
    height: 48,
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

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.screenPadding,
  },

  emptyTitle: {
    marginTop: 8,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: COLORS.subtitle,
    textAlign: "center",
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  bloodIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  bloodType: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: COLORS.text,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  statusLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },

  statusPillText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
  },

  viewButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: SPACING.buttonRadius,
  },

  viewButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: COLORS.primary,
  },

  // STYLES UNTUK MODAL
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
  modalBody: {
    marginBottom: 24,
  },
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
    fontStyle: "italic",
  },
  modalConnectButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
  },
  modalConnectButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "white",
  },
});
