// screens/OrderListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { fetchOrders, fetchOrderById, Order } from '@/app/services/orderService';
import { getToken } from '@/app/utils/profileUtil';

const OrderListScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // expandedOrder holds the order details that are expanded inline
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);
  const [expanding, setExpanding] = useState<boolean>(false);
  const router = useRouter();

  // Load orders from the backend using the auth token
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Missing token. Please log in.',
        });
        router.push('/authScreen');
        return;
      }
      const fetchedOrders = await fetchOrders(token);
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      const message = (err as Error).message || 'Failed to fetch orders';
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Toggle expansion of an order item. If already expanded, collapse it.
  const toggleExpandOrder = async (order: Order) => {
    if (expandedOrder && expandedOrder.id === order.id) {
      setExpandedOrder(null);
      return;
    }
    setExpanding(true);
    try {
      const token = await getToken();
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Missing token. Please log in.',
        });
        router.push('/authScreen');
        return;
      }
      // Fetch full order details (including order items)
      const orderDetails = await fetchOrderById(token, order.id);
      setExpandedOrder(orderDetails);
    } catch (err) {
      const message = (err as Error).message || 'Failed to fetch order details';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    } finally {
      setExpanding(false);
    }
  };

  // Render a single order item in the FlatList
  const renderOrderItem = ({ item }: { item: Order }) => {
    const isExpanded = expandedOrder?.id === item.id;
    return (
      <View style={styles.orderCard}>
        <TouchableOpacity onPress={() => toggleExpandOrder(item)}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.orderStatus}>{item.status.toUpperCase()}</Text>
          </View>
          <View style={styles.orderSubHeader}>
            <Text style={styles.orderTotal}>Total: ₱{item.total.toFixed(2)}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.orderDetails}>
            {expanding ? (
              <ActivityIndicator size="small" color="#D6003A" />
            ) : (
              <>
                <Text style={styles.detailLabel}>
                  Total: <Text style={styles.detailText}>₱{expandedOrder?.total.toFixed(2)}</Text>
                </Text>
                <Text style={styles.detailLabel}>
                  Status: <Text style={styles.detailText}>{expandedOrder?.status}</Text>
                </Text>
                <Text style={styles.detailLabel}>
                  Placed: <Text style={styles.detailText}>{new Date(expandedOrder?.createdAt || '').toLocaleString()}</Text>
                </Text>
                {/* If more details (like order items) are needed, include them here */}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3498db']} />
          }
          contentContainerStyle={orders.length === 0 ? styles.centeredContainer : undefined}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found. Start shopping now!</Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.linkText}>Go back to shopping</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found. Start shopping now!</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.linkText}>Go back to shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OrderListScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  orderTotal: {
    fontSize: 16,
    color: '#3498db',
  },
  orderDate: {
    fontSize: 14,
    color: '#888',
  },
  orderDetails: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  detailText: {
    fontWeight: 'normal',
    color: '#333',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#3498db',
    textDecorationLine: 'underline',
  },
});
