import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, SPACING } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

// ============================================
// DUMMY DATA — swap with real API data later
// ============================================

// Simple rule: 0 = critical (red), <=5 = low (orange), else fine (default text color).
const getQuantityColor = (quantity) => {
  if (quantity === 0) return COLORS.primary;
  if (quantity <= 5) return COLORS.warning;
  return COLORS.text;
};

const InventoryCard = ({ item }) => {
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

      <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
};

const InventoryScreen = () => {
  const [inventory, setInventory] = useState([]);

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
      console.log(err.response?.data);
      console.log(err.message);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Inventory</Text>
      </View>

      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <InventoryCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* ============== FLOATING ACTION BUTTON ============== */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
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
    paddingBottom: 100, // ruang biar item terakhir gak ketutup FAB
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
  fab: {
    position: "absolute",
    right: SPACING.screenPadding,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
