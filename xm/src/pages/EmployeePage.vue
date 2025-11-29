<template>
  <div class="employee-page min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-gray-900 p-4 md:p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">员工网络监控</h1>
          <p class="text-slate-400">实时监控员工网络活动和安全状态</p>
        </div>
        <t-button theme="primary" @click="refreshData" :loading="loading" class="shadow-lg">
          <RefreshCwIcon class="w-4 h-4 mr-2" />
          刷新数据
        </t-button>
      </div>
      
      <!-- 筛选和搜索区域 - 重新设计 -->
      <div class="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-300">搜索员工</label>
            <t-input 
              v-model="searchQuery" 
              placeholder="输入员工姓名或工号"
              @input="handleSearch"
              clearable
              class="bg-white/10 border-white/20"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-300">部门筛选</label>
            <t-select 
              v-model="selectedDepartment" 
              placeholder="选择部门"
              @change="handleDepartmentChange"
              clearable
              class="bg-white/10"
            >
              <t-option value="">全部部门</t-option>
              <t-option value="技术部">技术部</t-option>
              <t-option value="市场部">市场部</t-option>
              <t-option value="人事部">人事部</t-option>
              <t-option value="财务部">财务部</t-option>
            </t-select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-300">风险等级</label>
            <t-select 
              v-model="selectedRiskLevel" 
              placeholder="选择风险等级"
              @change="handleRiskLevelChange"
              clearable
              class="bg-white/10"
            >
              <t-option value="">全部等级</t-option>
              <t-option value="low">低风险</t-option>
              <t-option value="medium">中风险</t-option>
              <t-option value="high">高风险</t-option>
            </t-select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-300">视图模式</label>
            <div class="flex space-x-2">
              <t-button 
                :theme="viewMode === 'card' ? 'primary' : 'default'" 
                variant="outline" 
                size="small"
                @click="viewMode = 'card'"
                class="flex-1"
              >
                卡片
              </t-button>
              <t-button 
                :theme="viewMode === 'table' ? 'primary' : 'default'" 
                variant="outline" 
                size="small"
                @click="viewMode = 'table'"
                class="flex-1"
              >
                表格
              </t-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - 重新设计 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <div class="group bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm font-medium mb-1">总员工数</p>
            <p class="text-3xl font-bold text-white">{{ employeeStats.total }}</p>
            <p class="text-blue-300 text-xs mt-1">+2 较昨日</p>
          </div>
          <div class="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
            <UsersIcon class="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>
      
      <div class="group bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-200 text-sm font-medium mb-1">在线员工</p>
            <p class="text-3xl font-bold text-white">{{ employeeStats.online }}</p>
            <p class="text-green-300 text-xs mt-1">{{ Math.round(employeeStats.online / employeeStats.total * 100) }}% 在线率</p>
          </div>
          <div class="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
            <WifiIcon class="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>
      
      <div class="group bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20 hover:border-red-400/40 transition-all duration-300 hover:scale-105 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-200 text-sm font-medium mb-1">高风险员工</p>
            <p class="text-3xl font-bold text-white">{{ employeeStats.highRisk }}</p>
            <p class="text-red-300 text-xs mt-1">需要关注</p>
          </div>
          <div class="p-3 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
            <AlertTriangleIcon class="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>
      
      <div class="group bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-yellow-200 text-sm font-medium mb-1">平均流量</p>
            <p class="text-3xl font-bold text-white">{{ employeeStats.avgTraffic }}</p>
            <p class="text-yellow-300 text-xs mt-1">MB/天</p>
          </div>
          <div class="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
            <TrendingUpIcon class="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- AI员工行为分析区域 -->
    <div class="mb-8">
      <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-6 border border-purple-300/30">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
              <BrainIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-semibold text-white">AI员工行为分析</h3>
              <p class="text-purple-200">基于机器学习的员工网络行为分析与风险识别</p>
            </div>
          </div>
          <t-button theme="primary" variant="outline" @click="refreshEmployeeAIAnalysis" :loading="employeeAIAnalysisLoading">
            <RefreshCwIcon class="w-4 h-4 mr-2" />
            刷新分析
          </t-button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 高风险员工识别 -->
          <div class="bg-white/5 rounded-lg p-6">
            <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
              <ShieldIcon class="w-5 h-5 mr-2 text-red-400" />
              高风险员工识别
            </h4>
            <div class="space-y-4">
              <div v-for="riskEmployee in employeeAIInsights.riskEmployees" :key="riskEmployee.id" class="bg-white/5 rounded-lg p-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span class="text-white font-semibold text-sm">{{ riskEmployee.name.charAt(0) }}</span>
                      </div>
                      <div>
                        <h5 class="text-white font-medium">{{ riskEmployee.name }}</h5>
                        <p class="text-gray-400 text-xs">{{ riskEmployee.department }}</p>
                      </div>
                    </div>
                    <div class="space-y-1">
                      <div v-for="risk in riskEmployee.risks" :key="risk.type" class="flex items-center text-xs">
                        <div class="w-2 h-2 rounded-full mr-2" :class="getRiskColor(risk.level)"></div>
                        <span class="text-gray-300">{{ risk.description }}</span>
                      </div>
                    </div>
                  </div>
                  <t-tag :theme="riskEmployee.level === 'high' ? 'danger' : 'warning'" size="small">
                    {{ riskEmployee.level === 'high' ? '高风险' : '中风险' }}
                  </t-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 行为模式分析 -->
          <div class="bg-white/5 rounded-lg p-6">
            <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUpIcon class="w-5 h-5 mr-2 text-blue-400" />
              行为模式分析
            </h4>
            <div class="space-y-4">
              <div v-for="pattern in employeeAIInsights.behaviorPatterns" :key="pattern.id" class="bg-white/5 rounded-lg p-4">
                <div class="flex items-start">
                  <div class="w-2 h-2 rounded-full mt-2 mr-3" :class="getPatternColor(pattern.type)"></div>
                  <div class="flex-1">
                    <h5 class="text-white font-medium mb-1">{{ pattern.title }}</h5>
                    <p class="text-gray-300 text-sm mb-2">{{ pattern.description }}</p>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-gray-300">影响员工: {{ pattern.affectedCount }}人</span>
            <span class="text-blue-200">置信度: {{ pattern.confidence }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 安全建议 -->
          <div class="bg-white/5 rounded-lg p-6">
            <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
              <LightbulbIcon class="w-5 h-5 mr-2 text-yellow-400" />
              安全建议
            </h4>
            <div class="space-y-4">
              <div v-for="suggestion in employeeAIInsights.securitySuggestions" :key="suggestion.id" class="bg-white/5 rounded-lg p-4">
                <div class="flex items-start">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center mr-3" :class="getPriorityBg(suggestion.priority)">
                    <span class="text-xs font-bold text-white">{{ suggestion.priority === 'high' ? 'H' : suggestion.priority === 'medium' ? 'M' : 'L' }}</span>
                  </div>
                  <div class="flex-1">
                    <h5 class="text-white font-medium mb-1">{{ suggestion.title }}</h5>
                    <p class="text-gray-300 text-sm mb-2">{{ suggestion.description }}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-300">预期效果: {{ suggestion.expectedEffect }}</span>
                      <t-button size="small" theme="primary" variant="text" @click="applySecuritySuggestion(suggestion)">
                        应用建议
                      </t-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI分析状态 -->
        <div class="mt-6 flex items-center justify-between bg-white/5 rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            <span class="text-white text-sm">AI行为分析引擎运行中</span>
          </div>
          <div class="flex items-center space-x-4 text-sm text-gray-300">
            <span>上次更新: {{ formatTime(employeeAIInsights.lastUpdate) }}</span>
            <span>分析员工: {{ employeeAIInsights.analyzedEmployees }}人</span>
            <span>检测准确率: {{ employeeAIInsights.accuracy }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <!-- 员工列表区域 -->
      <div class="xl:col-span-3">
        <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div class="p-6 border-b border-white/10">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-white">员工列表</h3>
              <div class="flex items-center space-x-2 text-sm text-slate-400">
                <span>共 {{ employeeStats.total }} 人</span>
                <span>•</span>
                <span>{{ employeeStats.online }} 人在线</span>
              </div>
            </div>
          </div>
          
          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="p-6">
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="i in 6" :key="i" class="animate-pulse">
                <div class="bg-white/10 rounded-xl h-32"></div>
              </div>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="employee in filteredEmployees" 
                :key="employee.id"
                class="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                @click="viewEmployeeDetail(employee)"
              >
                <!-- 员工头像和基本信息 -->
                <div class="flex items-center space-x-3 mb-3">
                  <div class="relative">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span class="text-white font-semibold text-lg">{{ employee.name.charAt(0) }}</span>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" 
                         :class="employee.isOnline ? 'bg-green-400' : 'bg-gray-400'"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-white font-medium truncate">{{ employee.name }}</p>
                    <p class="text-slate-400 text-sm">{{ employee.employeeId }}</p>
                  </div>
                  <t-tag 
                    :theme="employee.riskLevel === 'high' ? 'danger' : employee.riskLevel === 'medium' ? 'warning' : 'success'"
                    variant="light"
                    size="small"
                  >
                    {{ employee.riskLevel === 'high' ? '高风险' : employee.riskLevel === 'medium' ? '中风险' : '低风险' }}
                  </t-tag>
                </div>

                <!-- 部门和状态 -->
                <div class="flex items-center justify-between mb-3">
                  <t-tag theme="primary" variant="light" size="small">{{ employee.department }}</t-tag>
                  <span :class="employee.isOnline ? 'text-green-300' : 'text-gray-300'" class="text-sm font-medium">
                    {{ employee.isOnline ? '在线' : '离线' }}
                  </span>
                </div>

                <!-- 流量信息 -->
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-300 text-sm">今日流量</span>
                    <span class="text-white font-medium">{{ Math.floor(employee.todayTraffic) }} MB</span>
                  </div>
                  <div class="w-full bg-slate-700/50 rounded-full h-2">
                    <div 
                      class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                      :style="{ width: Math.min((employee.todayTraffic / 1000) * 100, 100) + '%' }"
                    ></div>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <t-button size="small" theme="primary" variant="text" @click.stop="viewEmployeeDetail(employee)">
                    详情
                  </t-button>
                  <t-button size="small" theme="default" variant="text" @click.stop="viewEmployeeTraffic(employee)">
                    流量分析
                  </t-button>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="mt-6 flex justify-center">
              <t-pagination
                v-model:current="pagination.current"
                v-model:pageSize="pagination.pageSize"
                :total="pagination.total"
                @change="handlePageChange"
                theme="simple"
                class="text-white"
              />
            </div>
          </div>

          <!-- 表格视图 -->
          <div v-else class="p-6">
            <t-table 
              :data="filteredEmployees"
              :columns="tableColumns"
              :loading="loading"
              :pagination="pagination"
              @page-change="handlePageChange"
              row-key="id"
              stripe
              hover
              size="medium"
              class="bg-transparent"
            >
              <!-- ... existing code ... -->
              <!-- 员工信息列 -->
              <template #employee="{ row }">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold">{{ row.name.charAt(0) }}</span>
                  </div>
                  <div>
                    <p class="text-white font-medium">{{ row.name }}</p>
                    <p class="text-blue-200 text-sm">{{ row.employeeId }}</p>
                  </div>
                </div>
              </template>

              <!-- 部门列 -->
              <template #department="{ row }">
                <t-tag theme="primary" variant="light">{{ row.department }}</t-tag>
              </template>

              <!-- 在线状态列 -->
              <template #status="{ row }">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 rounded-full" :class="row.isOnline ? 'bg-green-400' : 'bg-gray-400'"></div>
                  <span :class="row.isOnline ? 'text-green-300' : 'text-gray-300'">
                    {{ row.isOnline ? '在线' : '离线' }}
                  </span>
                </div>
              </template>

              <!-- 流量列 -->
              <template #traffic="{ row }">
                <div>
                  <p class="text-white">{{ Math.floor(row.todayTraffic) }} MB</p>
                  <div class="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                    <div 
                      class="bg-blue-500 h-1.5 rounded-full" 
                      :style="{ width: Math.min((row.todayTraffic / 1000) * 100, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </template>

              <!-- 风险等级列 -->
              <template #risk="{ row }">
                <t-tag 
                  :theme="row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'success'"
                  variant="light"
                >
                  {{ row.riskLevel === 'high' ? '高风险' : row.riskLevel === 'medium' ? '中风险' : '低风险' }}
                </t-tag>
              </template>

              <!-- 操作列 -->
              <template #actions="{ row }">
                <div class="flex space-x-2">
                  <t-button size="small" theme="primary" variant="text" @click="viewEmployeeDetail(row)">
                    详情
                  </t-button>
                  <t-button size="small" theme="default" variant="text" @click="viewEmployeeTraffic(row)">
                    流量分析
                  </t-button>
                </div>
              </template>
            </t-table>
          </div>
        </div>
      </div>

      <!-- 右侧图表区域 -->
      <div class="space-y-6">
        <!-- 部门分布图 -->
        <div class="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            部门分布
          </h3>
          <div ref="departmentChartRef" class="h-64"></div>
        </div>

        <!-- 风险等级分布 -->
        <div class="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            风险等级分布
          </h3>
          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-green-400 font-medium">低风险</span>
                <span class="text-white font-semibold">{{ riskStats.low }}</span>
              </div>
              <div class="w-full bg-slate-700/50 rounded-full h-2">
                <div class="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500" 
                     :style="{ width: (riskStats.low / employeeStats.total * 100) + '%' }"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-yellow-400 font-medium">中风险</span>
                <span class="text-white font-semibold">{{ riskStats.medium }}</span>
              </div>
              <div class="w-full bg-slate-700/50 rounded-full h-2">
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-500" 
                     :style="{ width: (riskStats.medium / employeeStats.total * 100) + '%' }"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-red-400 font-medium">高风险</span>
                <span class="text-white font-semibold">{{ riskStats.high }}</span>
              </div>
              <div class="w-full bg-slate-700/50 rounded-full h-2">
                <div class="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500" 
                     :style="{ width: (riskStats.high / employeeStats.total * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 今日活跃度 -->
        <div class="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
            <div class="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            今日活跃度
          </h3>
          <div ref="activityChartRef" class="h-48"></div>
        </div>
      </div>
    </div>

    <!-- 员工详情弹窗 -->
    <t-dialog 
      v-model:visible="showEmployeeDetail" 
      header="员工详细信息"
      width="900px"
      :footer="false"
      class="employee-detail-dialog"
    >
      <div v-if="selectedEmployee" class="space-y-6">
        <!-- 基本信息卡片 -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-white font-bold text-2xl">{{ selectedEmployee.name.charAt(0) }}</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">{{ selectedEmployee.name }}</h3>
              <p class="text-gray-600">{{ selectedEmployee.department }} • {{ selectedEmployee.position }}</p>
              <p class="text-sm text-gray-300">工号: {{ selectedEmployee.employeeId }}</p>
            </div>
          </div>
        </div>

        <!-- 今日统计 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUpIcon class="w-6 h-6 text-white" />
            </div>
            <p class="text-3xl font-bold text-blue-600 mb-1">{{ Math.floor(selectedEmployee.todayTraffic) }}</p>
            <p class="text-sm text-blue-600 font-medium">MB 今日流量</p>
          </div>
          <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <WifiIcon class="w-6 h-6 text-white" />
            </div>
            <p class="text-3xl font-bold text-green-600 mb-1">{{ selectedEmployee.websiteVisits || 0 }}</p>
            <p class="text-sm text-green-600 font-medium">网站访问次数</p>
          </div>
          <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <UsersIcon class="w-6 h-6 text-white" />
            </div>
            <p class="text-3xl font-bold text-purple-600 mb-1">{{ selectedEmployee.onlineHours || 0 }}</p>
            <p class="text-sm text-purple-600 font-medium">小时在线时长</p>
          </div>
        </div>

        <!-- 流量趋势图 -->
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <h4 class="text-lg font-semibold mb-4 text-gray-800">7天流量趋势</h4>
          <div ref="employeeTrafficChartRef" class="h-64"></div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import { UsersIcon, WifiIcon, AlertTriangleIcon, TrendingUpIcon, RefreshCwIcon, BrainIcon, LightbulbIcon, ShieldIcon } from 'lucide-vue-next'

// 响应式数据
const loading = ref(false)
const employees = ref([])
const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedRiskLevel = ref('')
const showEmployeeDetail = ref(false)
const selectedEmployee = ref(null)
const viewMode = ref('card') // 新增视图模式

// AI分析相关数据
const employeeAIAnalysisLoading = ref(false)
const employeeAIInsights = ref({
  riskEmployees: [
    {
      id: 1,
      name: '张三',
      department: '技术部',
      level: 'high',
      risks: [
        { type: 'access', level: 'high', description: '访问敏感网站' },
        { type: 'download', level: 'medium', description: '异常下载行为' },
        { type: 'time', level: 'low', description: '工作时间外活跃' }
      ]
    },
    {
      id: 2,
      name: '李四',
      department: '市场部',
      level: 'medium',
      risks: [
        { type: 'transfer', level: 'high', description: '大量文件传输' },
        { type: 'competitor', level: 'medium', description: '访问竞争对手网站' }
      ]
    }
  ],
  behaviorPatterns: [
    {
      id: 1,
      type: 'time',
      title: '工作时间外高频访问',
      description: '发现12名员工在非工作时间频繁访问公司系统',
      affectedCount: 12,
      confidence: 85
    },
    {
      id: 2,
      type: 'download',
      title: '异常文件下载',
      description: '8名员工存在大量文件下载行为，需要关注',
      affectedCount: 8,
      confidence: 78
    },
    {
      id: 3,
      type: 'social',
      title: '社交媒体过度使用',
      description: '25名员工工作时间过度使用社交媒体',
      affectedCount: 25,
      confidence: 92
    }
  ],
  securitySuggestions: [
    {
      id: 1,
      title: '加强访问控制',
      priority: 'high',
      description: '建议对高风险员工实施更严格的网络访问控制',
      expectedEffect: '可降低数据泄露风险60%'
    },
    {
      id: 2,
      title: '定期安全培训',
      priority: 'medium',
      description: '针对异常行为模式开展专项安全意识培训',
      expectedEffect: '预计提升安全意识40%'
    },
    {
      id: 3,
      title: '实时监控优化',
      priority: 'medium',
      description: '优化实时监控算法，提高异常行为检测准确率',
      expectedEffect: '提升检测效率25%'
    }
  ],
  lastUpdate: new Date(),
  analyzedEmployees: 156,
  accuracy: 94
})

// 图表引用
const departmentChartRef = ref()
const activityChartRef = ref()
const employeeTrafficChartRef = ref()

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 12, // 卡片模式下增加每页显示数量
  total: 0
})

// 表格列配置
const tableColumns = [
  {
    colKey: 'employee',
    title: '员工信息',
    width: 200,
    cell: 'employee'
  },
  {
    colKey: 'department',
    title: '部门',
    width: 120,
    cell: 'department'
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    cell: 'status'
  },
  {
    colKey: 'traffic',
    title: '今日流量',
    width: 150,
    cell: 'traffic'
  },
  {
    colKey: 'risk',
    title: '风险等级',
    width: 120,
    cell: 'risk'
  },
  {
    colKey: 'actions',
    title: '操作',
    width: 150,
    cell: 'actions'
  }
]

// 计算属性
const filteredEmployees = computed(() => {
  let filtered = employees.value

  if (searchQuery.value) {
    filtered = filtered.filter(emp => 
      emp.name.includes(searchQuery.value) || 
      emp.employeeId.includes(searchQuery.value)
    )
  }

  if (selectedDepartment.value) {
    filtered = filtered.filter(emp => emp.department === selectedDepartment.value)
  }

  if (selectedRiskLevel.value) {
    filtered = filtered.filter(emp => emp.riskLevel === selectedRiskLevel.value)
  }

  pagination.value.total = filtered.length
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  
  return filtered.slice(start, end)
})

const employeeStats = computed(() => {
  const total = employees.value.length
  const online = employees.value.filter(emp => emp.isOnline).length
  const highRisk = employees.value.filter(emp => emp.riskLevel === 'high').length
  const avgTraffic = total > 0 ? Math.floor(employees.value.reduce((sum, emp) => sum + emp.todayTraffic, 0) / total) : 0

  return { total, online, highRisk, avgTraffic }
})

const riskStats = computed(() => {
  const low = employees.value.filter(emp => emp.riskLevel === 'low').length
  const medium = employees.value.filter(emp => emp.riskLevel === 'medium').length
  const high = employees.value.filter(emp => emp.riskLevel === 'high').length

  return { low, medium, high }
})

/**
 * 获取员工列表数据
 */
const fetchEmployees = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: pagination.value.current.toString(),
      limit: pagination.value.pageSize.toString()
    })

    if (selectedDepartment.value) {
      params.append('department', selectedDepartment.value)
    }
    if (selectedRiskLevel.value) {
      params.append('riskLevel', selectedRiskLevel.value)
    }

    const response = await fetch(`/api/employees?${params}`)
    const result = await response.json()
    
    if (result.success) {
      employees.value = result.data.employees
      pagination.value.total = result.data.total
    }
  } catch (error) {
    console.error('获取员工数据失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 初始化部门分布图表
 */
const initDepartmentChart = () => {
  if (!departmentChartRef.value) return

  const chart = echarts.init(departmentChartRef.value)
  
  const departmentData = employees.value.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1
    return acc
  }, {})

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: Object.entries(departmentData).map(([name, value]) => ({ name, value })),
      itemStyle: {
        borderRadius: 8,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2
      },
      label: {
        color: '#a0c4ff',
        fontSize: 12
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  chart.setOption(option)
}

/**
 * 初始化活跃度图表
 */
const initActivityChart = () => {
  if (!activityChartRef.value) return

  const chart = echarts.init(activityChartRef.value)
  
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const activityData = hours.map(hour => {
    return employees.value.filter(emp => {
      const lastActive = new Date(emp.lastActiveTime).getHours()
      return Math.abs(lastActive - hour) <= 1
    }).length
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#1890ff',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours.map(h => h + ':00'),
      axisLine: { lineStyle: { color: '#4a90e2' } },
      axisLabel: { color: '#a0c4ff', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4a90e2' } },
      axisLabel: { color: '#a0c4ff' },
      splitLine: { lineStyle: { color: '#2a4a6b' } }
    },
    series: [{
      data: activityData,
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#1890ff' },
          { offset: 1, color: '#096dd9' }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  }

  chart.setOption(option)
}

/**
 * 事件处理函数
 */
const handleSearch = () => {
  pagination.value.current = 1
}

const handleDepartmentChange = () => {
  pagination.value.current = 1
  fetchEmployees()
}

const handleRiskLevelChange = () => {
  pagination.value.current = 1
  fetchEmployees()
}

const handlePageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
  pagination.value.pageSize = pageInfo.pageSize
  fetchEmployees()
}

const refreshData = () => {
  fetchEmployees()
}

const viewEmployeeDetail = (employee) => {
  selectedEmployee.value = employee
  showEmployeeDetail.value = true
}

const viewEmployeeTraffic = (employee) => {
  // 这里可以跳转到员工流量详情页面
  console.log('查看员工流量:', employee)
}

/**
 * AI分析相关方法
 */
const getRiskColor = (level) => {
  switch (level) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const getPatternColor = (type) => {
  switch (type) {
    case 'time': return 'bg-blue-500'
    case 'download': return 'bg-purple-500'
    case 'social': return 'bg-orange-500'
    case 'transfer': return 'bg-pink-500'
    case 'access': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getPriorityBg = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const refreshEmployeeAIAnalysis = async () => {
  employeeAIAnalysisLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新AI分析数据
    employeeAIInsights.value.lastUpdate = new Date()
    employeeAIInsights.value.analyzedEmployees = Math.floor(Math.random() * 50) + 150
    employeeAIInsights.value.accuracy = Math.floor(Math.random() * 10) + 90
    
    console.log('AI员工行为分析数据已更新')
  } catch (error) {
    console.error('更新AI分析失败:', error)
  } finally {
    employeeAIAnalysisLoading.value = false
  }
}

const applySecuritySuggestion = (suggestion) => {
  console.log('应用安全建议:', suggestion.title)
  // 这里可以实现具体的建议应用逻辑
}

const formatTime = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

/**
 * 监听员工详情弹窗显示状态
 */
watch(showEmployeeDetail, (visible) => {
  if (visible && selectedEmployee.value) {
    // 延迟初始化图表，确保DOM已渲染
    setTimeout(() => {
      initEmployeeTrafficChart()
    }, 100)
  }
})

/**
 * 初始化员工流量趋势图表
 */
const initEmployeeTrafficChart = () => {
  if (!employeeTrafficChartRef.value) return

  const chart = echarts.init(employeeTrafficChartRef.value)
  
  // 生成7天的模拟数据
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  })

  const trafficData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 500 + 100))

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days
    },
    yAxis: {
      type: 'value',
      name: 'MB'
    },
    series: [{
      data: trafficData,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
          { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
        ])
      },
      lineStyle: { color: '#1890ff', width: 3 },
      itemStyle: { color: '#1890ff' }
    }]
  }

  chart.setOption(option)
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  fetchEmployees()
  
  // 延迟初始化图表
  setTimeout(() => {
    initDepartmentChart()
    initActivityChart()
  }, 500)
})
</script>

<style scoped>
.employee-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.employee-detail-dialog :deep(.t-dialog__body) {
  padding: 0;
}

.employee-detail-dialog :deep(.t-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 卡片悬停效果 */
.group:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.employee-page > * {
  animation: fadeInUp 0.6s ease-out;
}
</style>