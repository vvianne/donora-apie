import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import { COLORS, SPACING } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const STATUS_STYLES = {
  pending: { bg: "#FFF4E5", text: COLORS.warning, icon: "clock-outline" },
  accepted: { bg: "#E0F2FE", text: "#0284C7", icon: "checkmark-circle-outline" },
  on_the_way: { bg: "#FEF3C7", text: "#D97706", icon: "navigate-outline" },
  completed: { bg: "#ECFDF3", text: COLORS.success, icon: "checkmark-done-outline" },
};

const TransportationDashboard = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ full_name: "", location: "" });
  const [showMenu, setShowMenu] = useState(false);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await api.get("/transportation/my-tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.log("Failed to fetch tasks:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data?.data || { full_name: "", location: "" });
    } catch (error) {
      console.log("Failed to fetch profile:", error.response?.data || error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("access_token");
      setShowMenu(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Sign out failed:", error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProfile();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await api.patch(
        `/transportation/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
      setShowDetailModal(false);
    } catch (error) {
      console.log("Failed to update status:", error.response?.data || error.message);
    }
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Task Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hospital</Text>
                  <Text style={styles.detailValue}>{selectedTask.hospital_name}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pickup Location</Text>
                  <Text style={styles.detailValue}>{selectedTask.pickup_location}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Destination</Text>
                  <Text style={styles.detailValue}>{selectedTask.dropoff_location}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Blood Type</Text>
                  <View style={styles.bloodTypePill}>
                    <Text style={styles.bloodTypeText}>{selectedTask.blood_type}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Units Required</Text>
                  <Text style={styles.detailValue}>{selectedTask.units_required}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Current Status</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: STATUS_STYLES[selectedTask.status]?.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: STATUS_STYLES[selectedTask.status]?.text },
                      ]}
                    >
                      {selectedTask.status.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.actionTitle}>Update Status</Text>

                {selectedTask.status === "pending" && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => updateTaskStatus(selectedTask.id, "accepted")}
                  >
                    <Text style={styles.actionButtonText}>Accept Task</Text>
                  </TouchableOpacity>
                )}

                {selectedTask.status === "accepted" && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => updateTaskStatus(selectedTask.id, "on_the_way")}
                  >
                    <Text style={styles.actionButtonText}>Start Delivery</Text>
                  </TouchableOpacity>
                )}

                {selectedTask.status === "on_the_way" && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => updateTaskStatus(selectedTask.id, "completed")}
                  >
                    <Text style={styles.actionButtonText}>Mark as Completed</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuCard} activeOpacity={1}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("Profile");
              }}
            >
              <Ionicons name="person-circle" size={24} color={COLORS.text} />
              <Text style={styles.menuItemText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
              <Text style={[styles.menuItemText, { color: COLORS.primary }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <Text style={styles.title}>Transportation Dashboard</Text>
            <Text style={styles.subtitle}>{profile.full_name || "Transporter"} • {profile.location || "Location not set"}</Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(true)}
          >
            <Ionicons name="menu" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{tasks.length}</Text>
            <Text style={styles.summaryLabel}>Total Tasks</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {tasks.filter((t) => t.status === "pending").length}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {tasks.filter((t) => t.status === "completed").length}
            </Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Assigned Tasks</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading tasks...</Text>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="truck-outline"
              size={48}
              color={COLORS.subtitle}
            />
            <Text style={styles.emptyText}>No tasks assigned</Text>
          </View>
        ) : (
          tasks.map((task) => {
            const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.pending;
            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => handleTaskPress(task)}
                activeOpacity={0.8}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskHeaderLeft}>
                    <Text style={styles.hospitalName}>{task.hospital_name}</Text>
                    <Text style={styles.taskTime}>
                      {new Date(task.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
                  >
                    <Ionicons
                      name={statusStyle.icon}
                      size={14}
                      color={statusStyle.text}
                    />
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {task.status.replace("_", " ")}
                    </Text>
                  </View>
                </View>

                <View style={styles.taskDivider} />

                <View style={styles.taskDetails}>
                  <View style={styles.taskDetailItem}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={COLORS.subtitle}
                    />
                    <Text style={styles.taskDetailText}>{task.pickup_location}</Text>
                  </View>
                  <View style={styles.taskDetailItem}>
                    <Ionicons
                      name="navigate-outline"
                      size={16}
                      color={COLORS.subtitle}
                    />
                    <Text style={styles.taskDetailText}>{task.dropoff_location}</Text>
                  </View>
                </View>

                <View style={styles.taskFooter}>
                  <View style={styles.bloodTypeBadge}>
                    <Text style={styles.bloodTypeBadgeText}>
                      {task.blood_type}
                    </Text>
                  </View>
                  <Text style={styles.unitsText}>{task.units_required} units</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransportationDashboard;

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
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: SPACING.screenPadding,
  },
  headerLeft: {
    flex: 1,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  greeting: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 26,
    color: COLORS.text,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
    marginTop: 2,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: COLORS.text,
  },
  summaryLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 14,
  },
  loadingText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
    textAlign: "center",
    marginTop: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
    marginTop: 12,
  },
  taskCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    padding: SPACING.cardPadding,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  taskHeaderLeft: {
    flex: 1,
  },
  hospitalName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: COLORS.text,
  },
  taskTime: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
  },
  taskDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  taskDetails: {
    gap: 8,
  },
  taskDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskDetailText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  bloodTypeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bloodTypeBadgeText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    color: "white",
  },
  unitsText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: COLORS.subtitle,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: SPACING.cardRadius,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
  },
  modalContent: {
    padding: SPACING.cardPadding,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: COLORS.subtitle,
  },
  detailValue: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    textAlign: "right",
  },
  bloodTypePill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bloodTypeText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    color: "white",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPillText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
  },
  actionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SPACING.buttonRadius,
    alignItems: "center",
  },
  actionButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "white",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.cardPadding,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  menuItemText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: COLORS.text,
  },
});
