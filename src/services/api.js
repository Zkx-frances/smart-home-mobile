const API_BASE = '/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(errorData.error || '请求失败', response.status)
  }
  return response.json()
}

// 配置相关API
export const configApi = {
  getConfig: () =>
    fetch(`${API_BASE}/config/home-assistant`).then(handleResponse),
  
  setConfig: (url, token) =>
    fetch(`${API_BASE}/config/home-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, token }),
    }).then(handleResponse),
  
  testConnection: (url, token) =>
    fetch(`${API_BASE}/config/home-assistant/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, token }),
    }).then(handleResponse),
  
  getStatus: () =>
    fetch(`${API_BASE}/config/home-assistant/status`).then(handleResponse),
  
  restartWebSocket: () =>
    fetch(`${API_BASE}/config/home-assistant/websocket/restart`, {
      method: 'POST',
    }).then(handleResponse),
}

// 设备相关API
export const deviceApi = {
  getDevices: () =>
    fetch(`${API_BASE}/devices`).then(handleResponse),
  
  getDevice: (id) =>
    fetch(`${API_BASE}/devices/${id}`).then(handleResponse),
  
  deleteDevice: (id) =>
    fetch(`${API_BASE}/devices/${id}`, {
      method: 'DELETE',
    }),
  
  discoverDevices: () =>
    fetch(`${API_BASE}/devices/discover`, {
      method: 'POST',
    }).then(handleResponse),
  
  syncDevices: () =>
    fetch(`${API_BASE}/devices/sync`, {
      method: 'POST',
    }).then(handleResponse),
  
  controlDevice: (id, service, serviceData = {}) =>
    fetch(`${API_BASE}/devices/${id}/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service, service_data: serviceData }),
    }).then(handleResponse),
  
  controlDeviceByEntity: (entityId, service, serviceData = {}) =>
    fetch(`${API_BASE}/devices/entity/${entityId}/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service, service_data: serviceData }),
    }).then(handleResponse),
  
  getDeviceState: (id) =>
    fetch(`${API_BASE}/devices/${id}/state`).then(handleResponse),
  
  getDeviceStateByEntity: (entityId) =>
    fetch(`${API_BASE}/devices/entity/${entityId}/state`).then(handleResponse),
  
  addDevice: (entityId) =>
    fetch(`${API_BASE}/devices/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_id: entityId }),
    }).then(handleResponse),
}

