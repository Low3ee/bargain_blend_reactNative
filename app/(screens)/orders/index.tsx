import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  ScrollView 
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Order, fetchOrders, fetchOrderById } from '@/services/orderService';
import { getAuthToken } from '@/services/authService';
import Toast from 'react-native-toast-message';
import { getProduct, Product } from '@/services/productService';

type OrderItemWithProduct = {
  id: number;
  product: Product;
  quantity: number;
  price: number;
};

type ExpandedOrderWithProducts = Order & {
  orderItemsDetailed: OrderItemWithProduct[];
};

const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const OrderListScreen = () => {
  const navigation = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<ExpandedOrderWithProducts | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expanding, setExpanding] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          Toast.show({
            type: 'error',
            text1: 'Authentication Error',
            text2: 'Missing token. Please log in.',
          });
          navigation.replace('/authScreen');
          return;
        }
        const fetchedOrders = await fetchOrders(token);
        setOrders(fetchedOrders);
      } catch (err) {
        const message = (err as Error).message || 'Failed to load orders';
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: message,
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const toggleExpandOrder = async (order: Order) => {
    if (expandedOrder && expandedOrder.id === order.id) {
      setExpandedOrder(null);
      return;
    }

    setExpanding(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Missing token. Please log in.',
        });
        navigation.navigate('authScreen' as never);
        return;
      }

      const orderDetails = await fetchOrderById(token, order.id);
      const orderItemsDetailed: OrderItemWithProduct[] = await Promise.all(
        orderDetails.orderItems.map(async (item: any) => {
          const product = await getProduct(item.productId.toString());
          return {
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            product,
          };
        })
      );
      setExpandedOrder({
        ...orderDetails,
        orderItemsDetailed,
      } as ExpandedOrderWithProducts);
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

  // Filtering logic: Make sure order.status matches one of the statuses exactly.
  const filteredOrders = selectedStatus === 'All'
    ? orders
    : orders.filter(order => order.status === selectedStatus.toLocaleLowerCase());

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isExpanded = expandedOrder?.id === item.id;
    return (
      <TouchableOpacity style={styles.card} onPress={() => toggleExpandOrder(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status.toLocaleUpperCase()}</Text>
          </View>
        </View>

        {isExpanded ? (
          <>
            {expandedOrder?.orderItemsDetailed?.map((orderItem) => (
              <View key={orderItem.id} style={styles.productRow}>
                <Image source={{ uri: orderItem.product.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{orderItem.product.name}</Text>
                  <Text style={styles.productDetails}>
                    ₱{orderItem.price.toFixed(2)} x {orderItem.quantity}
                  </Text>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => toggleExpandOrder(item)}>
              <Text style={styles.viewPrompt}>View Less ▲</Text>
            </TouchableOpacity>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                Total {expandedOrder?.orderItemsDetailed?.length ?? item.orderItems?.length ?? 0} items: ₱{item.total.toFixed(2)}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.collapsedInfo}>
            <Text style={styles.orderID}>Order ID: {item.id}</Text>
            <Text style={styles.orderDate}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.orderTotal}>Total: ₱{item.total.toFixed(2)}</Text>
            <Text style={styles.viewPrompt}>View More ▼</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed-height Tab Navigation */}
      <View style={styles.tabWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setSelectedStatus(status)}
              style={[styles.tabButton, selectedStatus === status && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, selectedStatus === status && styles.tabButtonTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.container}
        ListFooterComponent={expanding ? <ActivityIndicator size="small" color="#888" /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  /* Tab Nav Wrapper to fix height */
  tabWrapper: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  tabContainer: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#d1005c',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#333',
  },
  tabButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Card styling for orders
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#ffd6e7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d1005c',
  },
  // Expanded Product Row styling
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    marginBottom: 2,
  },
  productDetails: {
    fontSize: 13,
    color: '#666',
  },
  viewPrompt: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginTop: 4,
  },
  summaryRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  // Collapsed info styling (for when the order is not expanded)
  collapsedInfo: {
    marginTop: 8,
  },
  orderID: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 15,
    color: '#000',
    marginTop: 4,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderListScreen;
