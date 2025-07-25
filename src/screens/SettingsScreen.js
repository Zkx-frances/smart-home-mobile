import React, { useState, useEffect } from 'react';
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
import { configApi } from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const [configData, statusData] = await Promise.all([
        configApi.getConfig().catch(() => null),
        configApi.getStatus().catch(() => null),
      ]);
      
      if (configData) {
        setConfig(configData);
        setUrl(configData.url || '');
      }
      
      if (statusData) {
        setStatus(statusData);
      }
    } catch (error) {
      console.error('Load config error:', error);
    }
  };

  const handleTest = async () => {
    if (!url.trim() || !token.trim()) {
      Alert.alert('错误', '请填写URL和Token');
      return;
    }

    setIsTesting(true);
    try {
      await configApi.testConnection(url.trim(), token.trim());
      Alert.alert('成功', '连接测试成功');
    } catch (error) {
      Alert.alert('错误', `连接测试失败: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!url.trim() || !token.trim()) {
      Alert.alert('错误', '请填写URL和Token');
      return;
    }

    setIsLoading(true);
    try {
      const result = await configApi.setConfig(url.trim(), token.trim());
      setConfig(result.config);
      Alert.alert('成功', 'Home Assistant配置保存成功', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('错误', `保存配置失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatUrl = (inputUrl) => {
    let formattedUrl = inputUrl.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'http://' + formattedUrl;
    }
    return formattedUrl.replace(/\/$/, ''); // 移除末尾斜杠
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
          <Text style={styles.title}>配置 Home Assistant</Text>
        </View>

        {/* 当前状态 */}
        {status && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>连接状态</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>配置状态:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: status.configured ? '#10B981' : '#EF4444' }
              ]}>
                <Text style={styles.statusBadgeText}>
                  {status.configured ? '已配置' : '未配置'}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>连接状态:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: status.connected ? '#10B981' : '#EF4444' }
              ]}>
                <Text style={styles.statusBadgeText}>
                  {status.connected ? '已连接' : '未连接'}
                </Text>
              </View>
            </View>
            {status.url && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>当前URL:</Text>
                <Text style={styles.statusValue}>{status.url}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Home Assistant URL</Text>
            <TextInput
              style={styles.input}
              placeholder="http://192.168.1.100:8123"
              value={url}
              onChangeText={(text) => setUrl(formatUrl(text))}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>长期访问令牌</Text>
            <TextInput
              style={styles.input}
              placeholder="输入您的长期访问令牌"
              value={token}
              onChangeText={setToken}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={handleTest}
              disabled={isTesting || isLoading}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              )}
              <Text style={styles.buttonText}>测试连接</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading || isTesting}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="save" size={16} color="#FFFFFF" />
              )}
              <Text style={styles.buttonText}>保存配置</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>如何获取长期访问令牌：</Text>
          <View style={styles.helpSteps}>
            <Text style={styles.helpStep}>1. 登录到您的 Home Assistant</Text>
            <Text style={styles.helpStep}>2. 点击左下角的用户头像</Text>
            <Text style={styles.helpStep}>3. 滚动到"长期访问令牌"部分</Text>
            <Text style={styles.helpStep}>4. 点击"创建令牌"</Text>
            <Text style={styles.helpStep}>5. 输入令牌名称并点击"确定"</Text>
            <Text style={styles.helpStep}>6. 复制生成的令牌</Text>
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
  statusCard: {
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
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  testButton: {
    backgroundColor: '#6366F1',
  },
  saveButton: {
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
});

export default SettingsScreen;

