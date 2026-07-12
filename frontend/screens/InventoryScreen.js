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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, SPACING } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { EmptyState } from "../components/ui";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const getQuantityColor = (quantity) => {
  if (quantity === 0) return COLORS.primary;
  if (quantity <= 5) return COLORS.warning;
  return COLORS.text;
};

const InventoryCard = ({ item, onEdit }) => {
  const quantityColor = getQuantityColor(item.quantity);

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.bloodIconWrapper}>
          <Ionicons name="water" size={20} color={COLORS.primary} />
        </View>

        <View>
          <Text style={styles.bloodType}>{item.blood_type}</Text>
          <Text style={[styles.quantity, { color: quantityColor }]}>
            {item.quantity} Bags
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        activeOpacity={0.8}
        onPress={onEdit}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
};

const InventoryScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ blood_type: "O+", quantity: "1" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const response = await api.get("/blood_bank/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInventory(response.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const handleEditClick = (item) => {
    setForm({
      blood_type: item.blood_type,
      quantity: item.quantity.toString(),
    });
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setForm({ blood_type: "O+", quantity: "1" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
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

      if (editingId) {
        await api.put(
          `/blood_bank/inventory/${editingId}`,
          {
            blood_type: form.blood_type,
            quantity: Number(form.quantity),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Alert.alert("Success", "Inventory updated successfully.");
      } else {
        await api.post(
          "/blood_bank/inventory",
          {
            blood_type: form.blood_type,
            quantity: Number(form.quantity),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Alert.alert("Success", "Inventory added successfully.");
      }

      handleCancelEdit();
      await fetchInventory();
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not save inventory.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Inventory</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {editingId ? "Update Blood Stock" : "Add Blood Stock"}
        </Text>
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
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : editingId ? "Update Stock" : "Add Stock"}
          </Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: COLORS.warning, marginTop: 10 },
            ]}
            onPress={handleCancelEdit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {inventory.length === 0 ? (
        <EmptyState icon="water-outline" title="No blood inventory yet" message="Add the first stock record using the form above." />
      ) : (
        <FlatList
          data={inventory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <InventoryCard item={item} onEdit={() => handleEditClick(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default InventoryScreen;

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
    paddingBottom: 100,
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

  quantity: {
    marginTop: 4,
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },

  editButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: SPACING.buttonRadius,
  },

  editButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: COLORS.primary,
  },

  // ---------- FLOATING ACTION BUTTON ----------
});
