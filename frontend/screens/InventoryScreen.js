import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { COLORS, SHADOWS, SPACING, STATUS_COLORS } from "../theme";
import api from "../services/api";
import { EmptyState, LoadingState } from "../components/ui";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const getQuantityColor = (quantity) => {
  if (quantity === 0) return COLORS.primary;
  if (quantity <= 5) return COLORS.warning;
  return COLORS.text;
};

const formatOwnerType = (ownerType) =>
  ownerType === "blood_bank" ? "Blood Bank" : "Hospital";

const InventoryCard = ({ item, onEdit, onDelete, disabled }) => {
  const canManage = item.is_owned_by_current_user;

  return (
    <View style={styles.card}>
      <View style={styles.cardMainRow}>
        <View style={styles.cardLeft}>
          <View style={styles.bloodIconWrapper}>
            <Ionicons name="water" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.bloodType}>{item.blood_type}</Text>
            <Text
              style={[
                styles.quantity,
                { color: getQuantityColor(item.quantity) },
              ]}
            >
              {item.quantity} Bags
            </Text>
          </View>
        </View>

        {canManage && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.8}
              onPress={() => onEdit(item)}
              disabled={disabled}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.8}
              onPress={() => onDelete(item)}
              disabled={disabled}
            >
              <Ionicons name="trash-outline" size={17} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.facilityRow}>
        <Ionicons
          name={item.owner_type === "hospital" ? "business" : "water"}
          size={14}
          color={COLORS.subtitle}
        />
        <Text style={styles.facilityText}>
          {formatOwnerType(item.owner_type)} · {item.facility_name || "Unknown"}
        </Text>
        <Text style={styles.facilityLocation}>{item.location || "Unknown"}</Text>
      </View>
    </View>
  );
};

const InventoryScreen = ({ navigation }) => {
  const [inventory, setInventory] = useState([]);
  const [totals, setTotals] = useState({});
  const [location, setLocation] = useState("");
  const [form, setForm] = useState({ blood_type: "O+", quantity: "1" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInventory();
    const unsubscribe = navigation?.addListener?.("focus", fetchInventory);
    return unsubscribe;
  }, [navigation]);

  const fetchInventory = async () => {
    try {
      setFetching(true);
      setError("");
      const token = await AsyncStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const profileResponse = await api.get("/auth/profile", { headers });
      const authenticatedRole = String(
        profileResponse.data?.data?.role || "",
      ).toLowerCase();
      const response = await api.get("/blood_bank/inventory", { headers });

      setRole(authenticatedRole);
      setInventory(response.data?.data || []);
      setTotals(response.data?.totals || {});
      setLocation(response.data?.location || profileResponse.data?.data?.location || "");
    } catch (err) {
      console.log(err.response?.data || err.message);
      setInventory([]);
      setTotals({});
      setError(err.response?.data?.message || "Could not load inventory.");
    } finally {
      setFetching(false);
    }
  };

  const myInventory = useMemo(
    () => inventory.filter((item) => item.is_owned_by_current_user),
    [inventory],
  );
  const nearbyInventory = useMemo(
    () => inventory.filter((item) => !item.is_owned_by_current_user),
    [inventory],
  );
  const totalEntries = useMemo(
    () =>
      Object.entries(totals).sort(
        ([first], [second]) =>
          BLOOD_TYPES.indexOf(first) - BLOOD_TYPES.indexOf(second),
      ),
    [totals],
  );

  const resetForm = () => {
    setForm({ blood_type: "O+", quantity: "1" });
    setEditingId(null);
  };

  const handleEdit = (item) => {
    if (!item.is_owned_by_current_user || loading) return;
    setForm({
      blood_type: item.blood_type,
      quantity: String(item.quantity),
    });
    setEditingId(item.id);
  };

  const handleSubmit = async () => {
    if (loading || !["hospital", "blood_bank"].includes(role)) return;
    if (!form.blood_type || form.quantity === "") {
      Alert.alert("Missing details", "Blood type and quantity are required.");
      return;
    }

    const quantity = Number(form.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      Alert.alert(
        "Invalid quantity",
        "Quantity must be a non-negative integer.",
      );
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { blood_type: form.blood_type, quantity };

      if (editingId) {
        await api.put(`/blood_bank/inventory/${editingId}`, payload, { headers });
      } else {
        await api.post("/blood_bank/inventory", payload, { headers });
      }

      resetForm();
      await fetchInventory();
      Alert.alert(
        "Success",
        editingId
          ? "Inventory updated successfully."
          : "Inventory added successfully.",
      );
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not save inventory.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (loading || !item.is_owned_by_current_user) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      await api.delete(`/blood_bank/inventory/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingId === item.id) resetForm();
      await fetchInventory();
      Alert.alert("Success", "Inventory deleted successfully.");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not delete inventory.",
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item) => {
    if (loading || !item.is_owned_by_current_user) return;
    Alert.alert(
      "Delete inventory",
      `Delete your ${item.blood_type} inventory record?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(item),
        },
      ],
    );
  };

  const canManageInventory = ["hospital", "blood_bank"].includes(role);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Inventory</Text>
          <Text style={styles.pageSubtitle}>
            Manage your facility stock and view availability in {location || "your location"}.
          </Text>
        </View>

        {fetching ? <LoadingState label="Loading inventory…" /> : null}
        {!!error && !fetching ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Inventory unavailable"
            message={error}
          />
        ) : null}

        {!fetching && !error ? (
          <>
            <Text style={styles.sectionTitle}>Location Total</Text>
            <View style={styles.totalsCard}>
              <Text style={styles.totalsLocation}>{location || "Current location"}</Text>
              {totalEntries.length === 0 ? (
                <Text style={styles.mutedText}>No blood stock recorded yet.</Text>
              ) : (
                <View style={styles.totalsGrid}>
                  {totalEntries.map(([bloodType, quantity]) => (
                    <View key={bloodType} style={styles.totalItem}>
                      <Text style={styles.totalBloodType}>{bloodType}</Text>
                      <Text style={styles.totalQuantity}>{quantity} bags</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {canManageInventory && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {editingId ? "Update My Inventory" : "Add to My Inventory"}
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={form.blood_type}
                    onValueChange={(value) =>
                      setForm({ ...form, blood_type: value })
                    }
                    style={styles.picker}
                    dropdownIconColor={COLORS.text}
                  >
                    {BLOOD_TYPES.map((type) => (
                      <Picker.Item key={type} label={type} value={type} />
                    ))}
                  </Picker>
                </View>
                <TextInput
                  style={styles.input}
                  value={form.quantity}
                  onChangeText={(value) =>
                    setForm({ ...form, quantity: value })
                  }
                  placeholder="Quantity"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading
                      ? "Saving..."
                      : editingId
                        ? "Update Stock"
                        : "Add Stock"}
                  </Text>
                </TouchableOpacity>
                {editingId && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetForm}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={styles.sectionTitle}>My Inventory</Text>
            {myInventory.length === 0 ? (
              <View style={styles.inlineEmptyCard}>
                <Text style={styles.mutedText}>
                  Your facility has no inventory records yet.
                </Text>
              </View>
            ) : (
              myInventory.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={confirmDelete}
                  disabled={loading}
                />
              ))
            )}

            <Text style={styles.sectionTitle}>Other Facilities Nearby</Text>
            {nearbyInventory.length === 0 ? (
              <View style={styles.inlineEmptyCard}>
                <Text style={styles.mutedText}>
                  No other facility inventory is available in this location.
                </Text>
              </View>
            ) : (
              nearbyInventory.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  disabled={loading}
                />
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default InventoryScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },
  header: { paddingTop: SPACING.md, paddingBottom: SPACING.sectionGap },
  pageTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 30,
    color: COLORS.text,
  },
  pageSubtitle: {
    marginTop: SPACING.xs,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.subtitle,
  },
  sectionTitle: {
    marginTop: SPACING.sectionGap,
    marginBottom: 14,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
  },
  totalsCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 4,
    padding: SPACING.cardPadding - 4,
    ...SHADOWS.card,
  },
  totalsLocation: {
    marginBottom: SPACING.sm,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: COLORS.primary,
  },
  totalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  totalItem: {
    minWidth: "22%",
    backgroundColor: COLORS.secondary,
    borderRadius: SPACING.inputRadius,
    paddingHorizontal: 10,
    paddingVertical: SPACING.sm,
    alignItems: "center",
  },
  totalBloodType: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: COLORS.primary,
  },
  totalQuantity: {
    marginTop: SPACING.xs,
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    color: COLORS.text,
  },
  formCard: {
    marginTop: SPACING.sectionGap,
    padding: SPACING.cardPadding - 4,
    borderRadius: SPACING.cardRadius - 4,
    backgroundColor: COLORS.card,
    ...SHADOWS.card,
  },
  formTitle: {
    marginBottom: 12,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.inputRadius,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
  picker: { color: COLORS.text, height: 48 },
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
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.6 },
  submitButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: COLORS.card,
  },
  cancelButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 11,
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 6,
    padding: SPACING.cardPadding - 4,
    marginBottom: 14,
    ...SHADOWS.card,
  },
  cardMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  cardCopy: { flex: 1 },
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
  quantity: {
    marginTop: SPACING.xs,
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
  facilityRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  facilityText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: COLORS.subtitle,
  },
  facilityLocation: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: COLORS.primary,
  },
  cardActions: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  editButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: SPACING.buttonRadius,
  },
  editButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: COLORS.primary,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: SPACING.buttonRadius,
    backgroundColor: STATUS_COLORS.rejected.background,
    justifyContent: "center",
    alignItems: "center",
  },
  inlineEmptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius - 6,
    padding: SPACING.cardPadding - 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mutedText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.subtitle,
  },
});
