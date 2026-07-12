import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS, SPACING, STATUS_COLORS } from "../theme";

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const StatusBadge = ({ status }) => {
  const key = String(status || "pending").toLowerCase().replace(/\s+/g, "_");
  const palette = STATUS_COLORS[key] || STATUS_COLORS.cancelled;
  const label = key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <View style={[styles.badgeDot, { backgroundColor: palette.dot }]} />
      <Text style={[styles.badgeText, { color: palette.foreground }]}>{label}</Text>
    </View>
  );
};

export const EmptyState = ({ icon = "folder-open-outline", title, message }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIcon}><Ionicons name={icon} size={26} color={COLORS.primary} /></View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {!!message && <Text style={styles.emptyMessage}>{message}</Text>}
  </View>
);

export const LoadingState = ({ label = "Loading your information…" }) => (
  <View style={styles.loadingState}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding,
    borderWidth: 1,
    borderColor: "#F2F4F7",
    ...SHADOWS.card,
  },
  badge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 10, height: 28, borderRadius: 14 },
  badgeDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  badgeText: { fontFamily: "Poppins_600SemiBold", fontSize: 11 },
  emptyState: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 24 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.secondary, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: COLORS.text, textAlign: "center" },
  emptyMessage: { fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: COLORS.subtitle, textAlign: "center", marginTop: 6 },
  loadingState: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  loadingLabel: { fontFamily: "Poppins_400Regular", fontSize: 13, color: COLORS.subtitle, marginTop: 12 },
});
