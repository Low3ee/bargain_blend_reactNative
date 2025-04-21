import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { fetchOrderById, Order } from "../../../services/orderService";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getAuthToken } from "@/services/authService"; // Assuming you store token via context or asyncStorage

const OrderDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { id } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          throw new Error("Authentication token is missing.");
        }
        const data = await fetchOrderById(token, id);
        setOrder(data);
      } catch (error) {
        Alert.alert("Error", "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text>Order not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Order #{order.id}</Text>
        <View style={[styles.statusBadge, getStatusColor(order.status)]}>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Order Date</Text>
        <Text style={styles.value}>{new Date(order.createdAt).toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Items</Text>
        {order.orderItems?.length > 0 ? (
          order.orderItems.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.product?.name || "Unnamed"}</Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>₱{item.price}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noItems}>No items found.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.total}>₱{order.total}</Text>
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return { backgroundColor: "#facc15" };
    case "processing":
      return { backgroundColor: "#3b82f6" };
    case "completed":
      return { backgroundColor: "#22c55e" };
    case "cancelled":
      return { backgroundColor: "#ef4444" };
    default:
      return { backgroundColor: "#e5e7eb" };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    color: "#374151",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemQty: {
    width: 40,
    textAlign: "center",
  },
  itemPrice: {
    width: 80,
    textAlign: "right",
    fontWeight: "600",
  },
  noItems: {
    color: "#6b7280",
    fontStyle: "italic",
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
});

export default OrderDetailsScreen;
