import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, SPACING } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

// Status -> color mapping, consistent with the pill style used elsewhere in the app.
const STATUS_STYLES = {
  pending: { bg: "#FFF4E5", text: COLORS.warning },
  fulfilled: { bg: "#EFF4FF", text: "#3B82F6" },
  cancelled: { bg: "#FDECEC", text: COLORS.primary },
};

const RequestCard = ({ item }) => {
  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.pending;

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
            <View
              style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}
            >
              <Text
                style={[styles.statusPillText, { color: statusStyle.text }]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.viewButton} activeOpacity={0.8}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );
};

const RequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const response = await api.get("/hospital/request", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response.data.data || []);
    } catch (err) {
      console.log(err.response?.data);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Requests</Text>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RequestCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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

  loadingState: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
