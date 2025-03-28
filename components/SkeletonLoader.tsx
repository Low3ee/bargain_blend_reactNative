import React from 'react';
import { View, StyleSheet } from 'react-native';

const SkeletonLoader: React.FC = () => {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  skeletonImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#dcdcdc',
    borderRadius: 10,
  },
  skeletonText: {
    width: '60%',
    height: 20,
    backgroundColor: '#dcdcdc',
    marginTop: 10,
    borderRadius: 5,
  },
});

export default SkeletonLoader;
