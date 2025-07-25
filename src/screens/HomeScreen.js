import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DeviceCard from '../components/DeviceCard';
import { deviceApi, configApi } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError('');

    try {
      // 加载状态
      const statusData = await configApi.getStatus();
      setStatus(statusData);

      // 加载设备
      const devicesData = await deviceApi.getDevices();
      setDevices(devicesData);
    } catch (err) {
      setError('加载数据失败');
      console.error('Load data error:', err);
    } finally {
      if (showLoading) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  const handleDeviceControl = async (entityId, service, serviceData = {}) => {
    try {
      await deviceApi.controlDeviceByEntity(entityId, service, serviceData);
      // 延迟刷新设备状态
      setTimeout(() => {
        loadData(false);
      }, 1000);
    } catch (err) {
      Alert.alert('错误', `控制设备失败: ${err.message}`);
    }
  };

  const handleDeviceDelete = async (deviceId) => {
    try {
      await deviceApi.deleteDevice(deviceId);
      setDevices(devices.filter(d => d.id !== deviceId));
    } catch (err) {
      Alert.alert('错误', `删除设备失败: ${err.message}`);
    }
  };

  const handleDeviceRefresh = async (deviceId) => {
    try {
      const updatedDevice = await deviceApi.getDeviceState(deviceId);
      setDevices(devices.map(d => d.id === deviceId ? updatedDevice : d));
    } catch (err) {
      Alert.alert('错误', `刷新设备状态失败: ${err.message}`);
    }
  };

  const handleDiscoverDevices = async () => {
    setIsLoading(true);
    try {
      await deviceApi.syncDevices();
      await loadData(false);
    } catch (err) {
      Alert.alert('错误', `发现设备失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>智能家居管理器</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* 连接状态 */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: status?.connected ? '#10B981' : '#EF4444' }
        ]}>
          <Ionicons
            name={status?.connected ? 'wifi' : 'wifi-off'}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>
            {status?.connected ? '已连接' : '未连接'}
          </Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.discoverButton]}
          onPress={handleDiscoverDevices}
          disabled={isLoading}
        >
          <Ionicons name="search" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>发现设备</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => navigation.navigate('AddDevice')}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>添加设备</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.deviceCount}>设备列表 ({devices.length})</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="home" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>暂无设备</Text>
      <Text style={styles.emptyDescription}>
        点击"发现设备"来自动发现 Home Assistant 中的设备，
        或点击"添加设备"手动添加设备。
      </Text>
      <View style={styles.emptyActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.discoverButton]}
          onPress={handleDiscoverDevices}
          disabled={isLoading}
        >
          <Ionicons name="search" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>发现设备</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!status?.configured) {
    return (
      <View style={styles.configContainer}>
        <Ionicons name="settings" size={64} color="#D1D5DB" />
        <Text style={styles.configTitle}>欢迎使用智能家居管理器</Text>
        <Text style={styles.configDescription}>
          请先配置您的 Home Assistant 连接信息以开始使用。
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, styles.configButton]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>配置 Home Assistant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            onControl={handleDeviceControl}
            onDelete={handleDeviceDelete}
            onRefresh={handleDeviceRefresh}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
          />
        }
        contentContainerStyle={devices.length === 0 ? styles.emptyContainer : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  configContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  configTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  configDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  configButton: {
    backgroundColor: '#3B82F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  settingsButton: {
    padding: 8,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  discoverButton: {
    backgroundColor: '#6366F1',
  },
  addButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deviceCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: 'row',
  },
});

export default HomeScreen;

