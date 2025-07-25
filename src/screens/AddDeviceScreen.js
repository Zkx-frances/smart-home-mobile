import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deviceApi } from '../services/api';

const AddDeviceScreen = ({ navigation }) => {
  const [entityId, setEntityId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!entityId.trim()) {
      Alert.alert('错误', '请输入设备的 Entity ID');
      return;
    }

    setIsLoading(true);
    try {
      const result = await deviceApi.addDevice(entityId.trim());
      Alert.alert('成功', '设备添加成功', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('错误', `添加设备失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>添加设备</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.description}>
            输入设备的 Entity ID 来手动添加设备到管理器中
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Entity ID</Text>
            <TextInput
              style={styles.input}
              placeholder="例如: light.living_room_light"
              value={entityId}
              onChangeText={setEntityId}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAdd}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="add" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>添加设备</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>如何找到设备的 Entity ID：</Text>
          <View style={styles.helpSteps}>
            <Text style={styles.helpStep}>1. 在 Home Assistant 中打开"开发者工具"</Text>
            <Text style={styles.helpStep}>2. 点击"状态"选项卡</Text>
            <Text style={styles.helpStep}>3. 在列表中找到您要添加的设备</Text>
            <Text style={styles.helpStep}>4. 复制对应的 Entity ID（格式如 light.living_room）</Text>
          </View>
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>常见 Entity ID 示例：</Text>
          <View style={styles.examples}>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleType}>灯具:</Text>
              <Text style={styles.exampleId}>light.living_room_light</Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleType}>开关:</Text>
              <Text style={styles.exampleId}>switch.bedroom_fan</Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleType}>传感器:</Text>
              <Text style={styles.exampleId}>sensor.temperature_sensor</Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleType}>空调:</Text>
              <Text style={styles.exampleId}>climate.living_room_ac</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  form: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  helpSteps: {
    marginLeft: 8,
  },
  helpStep: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  exampleCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  examples: {
    marginLeft: 8,
  },
  exampleItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  exampleType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    width: 60,
  },
  exampleId: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default AddDeviceScreen;

