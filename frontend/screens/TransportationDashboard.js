import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../services/api";
import { COLORS, SHADOWS, SPACING } from "../theme";
import { EmptyState, LoadingState, StatusBadge } from "../components/ui";

const TransportationDashboard = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setError("");
      const token = await AsyncStorage.getItem("access_token");
      const response = await api.get("/transportation/my-tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data?.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load transportation tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadTasks);
    const interval = setInterval(loadTasks, 5000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, [navigation]);

  const updateStatus = async (taskId, status) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await api.patch(
        `/transportation/tasks/${taskId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await loadTasks();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Unable to update task.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Transportation</Text>
        <Text style={styles.subtitle}>Assigned donation transport tasks</Text>
        {loading ? <LoadingState label="Loading assigned deliveries…" /> : null}
        {!!error && (
          <TouchableOpacity style={styles.card} onPress={loadTasks}>
            <Text style={styles.error}>{error} Tap to retry.</Text>
          </TouchableOpacity>
        )}
        {!loading && !error && tasks.length === 0 ? (
          <EmptyState icon="car-outline" title="No assigned deliveries" message="New transport assignments will appear here." />
        ) : null}
        {tasks.map((task) => (
          <View key={task.id} style={styles.card}>
            <Text style={styles.taskTitle}>Task #{task.id}</Text>
            <Text style={styles.subtitle}>{task.pickup_location} → {task.dropoff_location}</Text>
            <View style={{ marginTop: 12 }}><StatusBadge status={task.status} /></View>
            {task.status === "assigned" && (
              <TouchableOpacity style={styles.button} onPress={() => updateStatus(task.id, "in_transit")}>
                <Text style={styles.buttonText}>Start Transport</Text>
              </TouchableOpacity>
            )}
            {task.status === "in_transit" && (
              <TouchableOpacity style={styles.button} onPress={() => updateStatus(task.id, "completed")}>
                <Text style={styles.buttonText}>Complete Delivery</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.screenPadding, paddingBottom: 40 },
  title: { fontSize: 28, fontFamily: "Poppins_700Bold", color: COLORS.text },
  subtitle: { color: COLORS.subtitle, marginTop: 4, fontFamily: "Poppins_400Regular", lineHeight: 20 },
  card: { backgroundColor: COLORS.card, padding: SPACING.cardPadding, borderRadius: SPACING.cardRadius, marginTop: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  taskTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: COLORS.text },
  status: { color: COLORS.primary, fontWeight: "700", marginTop: 12 },
  error: { color: COLORS.primary },
  button: { backgroundColor: COLORS.primary, height: 48, justifyContent: "center", borderRadius: SPACING.buttonRadius, marginTop: 16, alignItems: "center" },
  buttonText: { color: "white", fontFamily: "Poppins_600SemiBold" },
});

export default TransportationDashboard;
