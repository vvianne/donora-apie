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
import { COLORS, SPACING } from "../theme";

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
        {loading ? <ActivityIndicator color={COLORS.primary} /> : null}
        {!!error && (
          <TouchableOpacity style={styles.card} onPress={loadTasks}>
            <Text style={styles.error}>{error} Tap to retry.</Text>
          </TouchableOpacity>
        )}
        {!loading && !error && tasks.length === 0 ? (
          <View style={styles.card}><Text style={styles.subtitle}>No assigned tasks.</Text></View>
        ) : null}
        {tasks.map((task) => (
          <View key={task.id} style={styles.card}>
            <Text style={styles.taskTitle}>Task #{task.id}</Text>
            <Text style={styles.subtitle}>{task.pickup_location} → {task.dropoff_location}</Text>
            <Text style={styles.status}>{String(task.status).replace("_", " ").toUpperCase()}</Text>
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
  title: { fontSize: 28, fontWeight: "700", color: COLORS.text },
  subtitle: { color: COLORS.subtitle, marginTop: 4 },
  card: { backgroundColor: COLORS.card, padding: 16, borderRadius: 16, marginTop: 16 },
  taskTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  status: { color: COLORS.primary, fontWeight: "700", marginTop: 12 },
  error: { color: COLORS.primary },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 12, marginTop: 14, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700" },
});

export default TransportationDashboard;
