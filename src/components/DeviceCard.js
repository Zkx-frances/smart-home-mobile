import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Slider,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DeviceCard = ({ device, onControl, onDelete, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getDeviceIcon = (domain) => {
    const iconMap = {
      light: 'bulb',
      switch: 'power',
      sensor: 'thermometer',
      climate: 'thermometer',
      fan: 'fan',
      camera: 'camera',
      lock: 'lock-closed',
      media_player: 'volume-high',
      binary_sensor: 'speedometer',
    };
    
    return iconMap[domain] || 'power';
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'on':
      case 'open':
      case 'unlocked':
        return '#10B981';
      case 'off':
      case 'closed':
      case 'locked':
        return '#6B7280';
      case 'unavailable':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const service = device.state === 'on' ? 'turn_off' : 'turn_on';
      await onControl(device.entity_id, service);
    } catch (error) {
      Alert.alert('错误', '控制设备失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrightnessChange = async (value) => {
    setIsLoading(true);
    try {
      await onControl(device.entity_id, 'turn_on', { brightness: Math.round(value) });
    } catch (error) {
      Alert.alert('错误', '调节亮度失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '确认删除',
      `确定要删除设备 "${device.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: () => onDelete(device.id) },
      ]
    );
  };

  const renderControls = () => {
    const { domain, state, attributes } = device;

    switch (domain) {
      case 'light':
        return (
          <View style={styles.controls}>
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>开关</Text>
              <Switch
                value={state === 'on'}
                onValueChange={handleToggle}
                disabled={isLoading}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={state === 'on' ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
            {attributes.brightness && state === 'on' && (
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>亮度</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={255}
                  value={attributes.brightness || 0}
                  onSlidingComplete={handleBrightnessChange}
                  disabled={isLoading}
                  minimumTrackTintColor="#1fb28a"
                  maximumTrackTintColor="#d3d3d3"
                  thumbStyle={{ backgroundColor: '#1fb28a' }}
                />
              </View>
            )}
          </View>
        );

      case 'switch':
      case 'fan':
        return (
          <View style={styles.controls}>
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>开关</Text>
              <Switch
                value={state === 'on'}
                onValueChange={handleToggle}
                disabled={isLoading}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={state === 'on' ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.controls}>
            <Text style={styles.stateText}>状态: {state}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.deviceInfo}>
          <Ionicons
            name={getDeviceIcon(device.domain)}
            size={24}
            color="#374151"
            style={styles.icon}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceType}>{device.device_type}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <View style={[styles.stateBadge, { backgroundColor: getStateColor(device.state) }]}>
            <Text style={styles.stateText}>{device.state}</Text>
          </View>
          <TouchableOpacity onPress={() => onRefresh(device.id)} style={styles.actionButton}>
            <Ionicons name="refresh" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.entityId}>{device.entity_id}</Text>

      {renderControls()}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}

      {device.last_updated && (
        <Text style={styles.lastUpdated}>
          最后更新: {new Date(device.last_updated).toLocaleString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  deviceType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  stateText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
  entityId: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  controls: {
    marginTop: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  slider: {
    flex: 1,
    marginLeft: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  lastUpdated: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 8,
  },
});

export default DeviceCard;

