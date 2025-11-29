# API 接口文档

## 📋 目录
- [API 概览](#api-概览)
- [通用说明](#通用说明)
- [数据大屏 API](#数据大屏-api)
- [员工管理 API](#员工管理-api)
- [设备管理 API](#设备管理-api)
- [AI 聊天 API](#ai-聊天-api)
- [错误码说明](#错误码说明)
- [示例代码](#示例代码)

## 🌐 API 概览

企业网络监控数据大屏系统提供 RESTful API 接口，支持前端应用的所有功能需求。

### 基础信息
- **Base URL**: `http://localhost:3001/api`
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### API 模块

| 模块 | 路径前缀 | 功能描述 |
|------|----------|----------|
| 数据大屏 | `/dashboard` | 实时监控数据和统计信息 |
| 员工管理 | `/employees` | 员工信息的增删改查 |
| 设备管理 | `/devices` | 网络设备监控和管理 |
| AI 聊天 | `/chat` | 智能对话和分析功能 |

## 📝 通用说明

### 请求格式

所有 API 请求都应包含以下头部信息：

```http
Content-Type: application/json
Accept: application/json
```

### 响应格式

所有 API 响应都遵循统一的格式：

```typescript
interface ApiResponse<T> {
  code: number          // 状态码 (200: 成功, 其他: 错误)
  message: string       // 响应消息
  data: T              // 响应数据
  timestamp: number    // 时间戳
}
```

### 分页格式

对于列表类接口，支持分页查询：

```typescript
interface PaginationParams {
  page?: number        // 页码，从 1 开始
  pageSize?: number    // 每页数量，默认 20
  sortBy?: string      // 排序字段
  sortOrder?: 'asc' | 'desc'  // 排序方向
}

interface PaginatedResponse<T> {
  items: T[]           // 数据列表
  total: number        // 总数量
  page: number         // 当前页码
  pageSize: number     // 每页数量
  totalPages: number   // 总页数
}
```

## 📊 数据大屏 API

### 获取统计数据

获取数据大屏的统计信息。

```http
GET /api/dashboard/stats
```

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "networkStatus": {
      "online": 156,
      "offline": 12,
      "total": 168,
      "uptime": "99.2%"
    },
    "employeeStats": {
      "total": 245,
      "online": 189,
      "departments": 8,
      "newToday": 3
    },
    "deviceStats": {
      "total": 89,
      "active": 82,
      "warning": 5,
      "error": 2
    },
    "securityStats": {
      "alerts": 15,
      "threats": 3,
      "blocked": 127,
      "riskLevel": "medium"
    }
  },
  "timestamp": 1703123456789
}
```

### 获取告警信息

获取系统告警列表。

```http
GET /api/dashboard/alerts?level={level}&limit={limit}
```

**查询参数：**
- `level` (可选): 告警级别 (`critical`, `warning`, `info`)
- `limit` (可选): 返回数量限制，默认 50

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": "alert_001",
      "level": "critical",
      "title": "服务器 CPU 使用率过高",
      "message": "服务器 192.168.1.100 CPU 使用率达到 95%",
      "timestamp": 1703123456789,
      "source": "device_monitoring",
      "resolved": false
    }
  ],
  "timestamp": 1703123456789
}
```

### 获取实时数据

获取实时监控数据，用于图表展示。

```http
GET /api/dashboard/realtime?type={type}&duration={duration}
```

**查询参数：**
- `type`: 数据类型 (`network`, `cpu`, `memory`, `traffic`)
- `duration`: 时间范围 (`1h`, `6h`, `24h`, `7d`)

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "type": "network",
    "duration": "1h",
    "timestamps": [1703120000, 1703120300, 1703120600],
    "values": [85.2, 87.1, 89.5],
    "unit": "%"
  },
  "timestamp": 1703123456789
}
```

## 👥 员工管理 API

### 获取员工列表

获取员工信息列表，支持分页和筛选。

```http
GET /api/employees?page={page}&pageSize={pageSize}&department={department}&status={status}&search={search}
```

**查询参数：**
- `page` (可选): 页码，默认 1
- `pageSize` (可选): 每页数量，默认 20
- `department` (可选): 部门筛选
- `status` (可选): 状态筛选 (`online`, `offline`, `away`)
- `search` (可选): 搜索关键词

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "emp_001",
        "name": "张三",
        "email": "zhangsan@company.com",
        "department": "技术部",
        "position": "前端工程师",
        "status": "online",
        "avatar": "/avatars/zhangsan.jpg",
        "joinDate": "2023-01-15",
        "lastActive": 1703123456789,
        "riskLevel": "low",
        "deviceCount": 2,
        "location": "北京办公室"
      }
    ],
    "total": 245,
    "page": 1,
    "pageSize": 20,
    "totalPages": 13
  },
  "timestamp": 1703123456789
}
```

### 获取员工详情

获取指定员工的详细信息。

```http
GET /api/employees/{id}
```

**路径参数：**
- `id`: 员工 ID

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "emp_001",
    "name": "张三",
    "email": "zhangsan@company.com",
    "phone": "13800138000",
    "department": "技术部",
    "position": "前端工程师",
    "status": "online",
    "avatar": "/avatars/zhangsan.jpg",
    "joinDate": "2023-01-15",
    "lastActive": 1703123456789,
    "riskLevel": "low",
    "deviceCount": 2,
    "location": "北京办公室",
    "devices": [
      {
        "id": "dev_001",
        "name": "张三的笔记本",
        "type": "laptop",
        "ip": "192.168.1.101",
        "status": "online"
      }
    ],
    "activityLog": [
      {
        "timestamp": 1703123456789,
        "action": "login",
        "device": "dev_001",
        "location": "北京办公室"
      }
    ]
  },
  "timestamp": 1703123456789
}
```

### 创建员工

创建新的员工记录。

```http
POST /api/employees
```

**请求体：**
```json
{
  "name": "李四",
  "email": "lisi@company.com",
  "phone": "13900139000",
  "department": "技术部",
  "position": "后端工程师",
  "location": "上海办公室"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "emp_002",
    "name": "李四",
    "email": "lisi@company.com",
    "phone": "13900139000",
    "department": "技术部",
    "position": "后端工程师",
    "status": "offline",
    "avatar": "/avatars/default.jpg",
    "joinDate": "2024-01-20",
    "lastActive": null,
    "riskLevel": "low",
    "deviceCount": 0,
    "location": "上海办公室"
  },
  "timestamp": 1703123456789
}
```

### 更新员工信息

更新指定员工的信息。

```http
PUT /api/employees/{id}
```

**路径参数：**
- `id`: 员工 ID

**请求体：**
```json
{
  "name": "李四",
  "email": "lisi@company.com",
  "phone": "13900139000",
  "department": "技术部",
  "position": "高级后端工程师",
  "location": "上海办公室"
}
```

### 删除员工

删除指定员工记录。

```http
DELETE /api/employees/{id}
```

**路径参数：**
- `id`: 员工 ID

**响应示例：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null,
  "timestamp": 1703123456789
}
```

## 🖥️ 设备管理 API

### 获取设备列表

获取网络设备列表。

```http
GET /api/devices?page={page}&pageSize={pageSize}&type={type}&status={status}
```

**查询参数：**
- `page` (可选): 页码，默认 1
- `pageSize` (可选): 每页数量，默认 20
- `type` (可选): 设备类型 (`router`, `switch`, `server`, `laptop`, `mobile`)
- `status` (可选): 设备状态 (`online`, `offline`, `warning`, `error`)

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "dev_001",
        "name": "核心路由器-01",
        "type": "router",
        "ip": "192.168.1.1",
        "mac": "00:1B:44:11:3A:B7",
        "status": "online",
        "location": "机房A",
        "manufacturer": "Cisco",
        "model": "ISR4331",
        "lastSeen": 1703123456789,
        "uptime": "15天 8小时",
        "cpu": 25.6,
        "memory": 45.2,
        "temperature": 42,
        "ports": {
          "total": 24,
          "used": 18,
          "available": 6
        }
      }
    ],
    "total": 89,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  },
  "timestamp": 1703123456789
}
```

### 获取设备详情

获取指定设备的详细信息。

```http
GET /api/devices/{id}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "dev_001",
    "name": "核心路由器-01",
    "type": "router",
    "ip": "192.168.1.1",
    "mac": "00:1B:44:11:3A:B7",
    "status": "online",
    "location": "机房A",
    "manufacturer": "Cisco",
    "model": "ISR4331",
    "serialNumber": "FTX1234567890",
    "firmwareVersion": "16.09.04",
    "lastSeen": 1703123456789,
    "uptime": "15天 8小时",
    "performance": {
      "cpu": 25.6,
      "memory": 45.2,
      "temperature": 42,
      "diskUsage": 68.3
    },
    "network": {
      "bytesIn": 1024000000,
      "bytesOut": 2048000000,
      "packetsIn": 1500000,
      "packetsOut": 1800000,
      "errors": 0
    },
    "ports": [
      {
        "id": "port_001",
        "name": "GigabitEthernet0/0/0",
        "status": "up",
        "speed": "1000Mbps",
        "duplex": "full",
        "connectedDevice": "switch_001"
      }
    ]
  },
  "timestamp": 1703123456789
}
```

### 获取设备状态

获取设备实时状态信息。

```http
GET /api/devices/{id}/status
```

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "deviceId": "dev_001",
    "status": "online",
    "lastUpdate": 1703123456789,
    "performance": {
      "cpu": 25.6,
      "memory": 45.2,
      "temperature": 42,
      "diskUsage": 68.3
    },
    "alerts": [
      {
        "level": "warning",
        "message": "CPU 使用率较高",
        "timestamp": 1703123456789
      }
    ]
  },
  "timestamp": 1703123456789
}
```

### 更新设备配置

更新设备配置信息。

```http
PUT /api/devices/{id}/config
```

**请求体：**
```json
{
  "name": "核心路由器-01",
  "location": "机房A",
  "description": "主要网络出口路由器",
  "monitoringEnabled": true,
  "alertThresholds": {
    "cpu": 80,
    "memory": 85,
    "temperature": 70
  }
}
```

## 🤖 AI 聊天 API

### 发送消息

向 AI 助手发送消息并获取回复。

```http
POST /api/chat/message
```

**请求体：**
```json
{
  "message": "当前网络状态如何？",
  "sessionId": "session_001",
  "context": {
    "page": "dashboard",
    "userId": "user_001"
  }
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "发送成功",
  "data": {
    "id": "msg_001",
    "sessionId": "session_001",
    "userMessage": "当前网络状态如何？",
    "aiResponse": "根据最新数据，当前网络状态良好。在线设备 156 台，离线 12 台，整体可用性达到 99.2%。有 5 台设备显示警告状态，建议关注。",
    "timestamp": 1703123456789,
    "suggestions": [
      "查看告警详情",
      "显示设备列表",
      "生成状态报告"
    ]
  },
  "timestamp": 1703123456789
}
```

### 获取聊天历史

获取指定会话的聊天历史记录。

```http
GET /api/chat/history/{sessionId}?limit={limit}&offset={offset}
```

**路径参数：**
- `sessionId`: 会话 ID

**查询参数：**
- `limit` (可选): 返回数量限制，默认 50
- `offset` (可选): 偏移量，默认 0

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "sessionId": "session_001",
    "messages": [
      {
        "id": "msg_001",
        "type": "user",
        "content": "当前网络状态如何？",
        "timestamp": 1703123456789
      },
      {
        "id": "msg_002",
        "type": "ai",
        "content": "根据最新数据，当前网络状态良好...",
        "timestamp": 1703123456790,
        "suggestions": ["查看告警详情", "显示设备列表"]
      }
    ],
    "total": 10,
    "hasMore": false
  },
  "timestamp": 1703123456789
}
```

### 创建新会话

创建新的聊天会话。

```http
POST /api/chat/session
```

**请求体：**
```json
{
  "userId": "user_001",
  "title": "网络状态咨询"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "sessionId": "session_002",
    "userId": "user_001",
    "title": "网络状态咨询",
    "createdAt": 1703123456789,
    "lastActivity": 1703123456789
  },
  "timestamp": 1703123456789
}
```

## ❌ 错误码说明

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 业务错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 参数验证失败 |
| 1002 | 数据不存在 |
| 1003 | 数据已存在 |
| 1004 | 操作权限不足 |
| 1005 | 系统繁忙，请稍后重试 |

### 错误响应格式

```json
{
  "code": 400,
  "message": "参数验证失败",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  },
  "timestamp": 1703123456789
}
```

## 💻 示例代码

### JavaScript/TypeScript

```typescript
// API 客户端封装
class ApiClient {
  private baseURL = 'http://localhost:3001/api'
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    return response.json()
  }
  
  // 获取员工列表
  async getEmployees(params: EmployeeQueryParams): Promise<ApiResponse<PaginatedResponse<Employee>>> {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/employees?${query}`)
  }
  
  // 发送聊天消息
  async sendChatMessage(message: string, sessionId: string): Promise<ApiResponse<ChatMessage>> {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId })
    })
  }
}

// 使用示例
const api = new ApiClient()

// 获取员工列表
const employees = await api.getEmployees({
  page: 1,
  pageSize: 20,
  department: '技术部'
})

// 发送聊天消息
const chatResponse = await api.sendChatMessage('当前网络状态如何？', 'session_001')
```

### Vue 3 Composable

```typescript
// composables/useApi.ts
import { ref, reactive } from 'vue'

export function useEmployees() {
  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const fetchEmployees = async (params: EmployeeQueryParams = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getEmployees(params)
      if (response.code === 200) {
        employees.value = response.data.items
      } else {
        error.value = response.message
      }
    } catch (err) {
      error.value = '网络请求失败'
    } finally {
      loading.value = false
    }
  }
  
  return {
    employees,
    loading,
    error,
    fetchEmployees
  }
}
```

---

本 API 文档将随着项目功能的扩展持续更新。如有疑问，请联系开发团队。