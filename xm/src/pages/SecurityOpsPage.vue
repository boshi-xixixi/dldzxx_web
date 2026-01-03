<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 p-6">
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold text-white">网络安全监测与响应</h1>
        <p class="mt-2 text-slate-300">实时检测、告警联动、事件闭环与复盘沉淀（Mock 演示）</p>
      </div>
      <div class="flex gap-2">
        <t-button theme="primary" variant="outline" @click="refreshAll" :loading="refreshing">
          <RefreshCwIcon class="w-4 h-4 mr-2" />刷新
        </t-button>
        <t-button theme="primary" @click="openDailyReport" :loading="dailyLoading">
          <FileTextIcon class="w-4 h-4 mr-2" />生成安全日报
        </t-button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div class="text-xs text-slate-300">流量</div>
            <div class="mt-1 text-2xl font-bold text-white">{{ latestTelemetry?.trafficMbps ?? '-' }} Mbps</div>
            <div class="mt-2 text-xs text-slate-400">{{ latestTelemetry?.service || '-' }} / {{ latestTelemetry?.deviceId || '-' }}</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div class="text-xs text-slate-300">请求速率</div>
            <div class="mt-1 text-2xl font-bold text-white">{{ latestTelemetry?.rps ?? '-' }} rps</div>
            <div class="mt-2 text-xs text-slate-400">动态阈值检测中</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div class="text-xs text-slate-300">错误率</div>
            <div class="mt-1 text-2xl font-bold text-white">{{ formatPct(latestTelemetry?.errorRate) }}</div>
            <div class="mt-2 text-xs text-slate-400">服务可用性观察</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div class="text-xs text-slate-300">延迟</div>
            <div class="mt-1 text-2xl font-bold text-white">{{ latestTelemetry?.latencyMs ?? '-' }} ms</div>
            <div class="mt-2 text-xs text-slate-400">链路健康度</div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
          <div class="p-4 border-b border-white/10 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ShieldIcon class="w-5 h-5 text-blue-300" />
              <div class="text-white font-semibold">事件处置</div>
              <div class="text-xs text-slate-400">全流程记录 + 恢复进度</div>
            </div>
            <div class="flex gap-2">
              <t-button size="small" theme="primary" variant="outline" @click="exportEventsCsv" :disabled="events.length === 0">
                导出事件CSV
              </t-button>
              <t-button size="small" theme="primary" variant="outline" @click="runVulnScan" :loading="scanLoading">
                漏洞扫描
              </t-button>
              <t-button size="small" theme="primary" variant="outline" @click="runCompliance" :loading="complianceLoading">
                合规评估
              </t-button>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2">
            <div class="p-4 border-b xl:border-b-0 xl:border-r border-white/10">
              <div class="text-sm text-slate-200 font-medium mb-3">事件列表</div>
              <div class="space-y-2 max-h-[520px] overflow-auto pr-1">
                <button
                  v-for="e in events"
                  :key="e.id"
                  class="w-full text-left p-3 rounded-lg border transition-colors"
                  :class="e.id === selectedEventId ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'"
                  @click="selectEvent(e.id)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-xs font-semibold" :class="severityClass(e.severity)">
                          {{ severityLabel(e.severity) }}
                        </span>
                        <span class="text-xs text-slate-400">{{ formatTime(e.timestamp) }}</span>
                        <span class="text-xs text-slate-400">·</span>
                        <span class="text-xs text-slate-300">{{ statusLabel(e.status) }}</span>
                      </div>
                      <div class="mt-1 text-white font-medium truncate">{{ e.title }}</div>
                      <div class="mt-1 text-xs text-slate-400 truncate">{{ e.description }}</div>
                    </div>
                    <div class="shrink-0 w-24">
                      <t-progress :percentage="e.recoveryProgress" size="small" />
                    </div>
                  </div>
                </button>
                <div v-if="events.length === 0" class="text-sm text-slate-400">暂无事件</div>
              </div>
            </div>

            <div class="p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <div class="text-sm text-slate-200 font-medium">事件详情</div>
                  <div class="mt-1 text-lg font-semibold text-white truncate">{{ selectedEvent?.title || '请选择事件' }}</div>
                  <div v-if="selectedEvent" class="mt-1 text-xs text-slate-400">
                    {{ selectedEvent.source?.service || '-' }} / {{ selectedEvent.source?.deviceId || '-' }} · {{ selectedEvent.id }}
                  </div>
                </div>
                <div class="flex gap-2" v-if="selectedEvent">
                  <t-button size="small" theme="primary" variant="outline" @click="generateReport" :loading="reportLoading">
                    AI报告
                  </t-button>
                  <t-button size="small" theme="primary" @click="advanceProgress(10)">推进 +10%</t-button>
                </div>
              </div>

              <div v-if="selectedEvent" class="mt-4 space-y-4">
                <div class="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div class="flex items-center justify-between">
                    <div class="text-xs text-slate-400">恢复进度</div>
                    <div class="text-xs text-slate-300">{{ statusLabel(selectedEvent.status) }}</div>
                  </div>
                  <div class="mt-2">
                    <t-progress :percentage="selectedEvent.recoveryProgress" />
                  </div>
                  <div class="mt-3 flex gap-2">
                    <t-button size="small" variant="outline" @click="setStatus('investigating')">处置中</t-button>
                    <t-button size="small" variant="outline" @click="setStatus('mitigated')">已缓解</t-button>
                    <t-button size="small" theme="primary" variant="outline" @click="setStatus('resolved')">已恢复</t-button>
                  </div>
                </div>

                <div class="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div class="text-sm text-white font-medium mb-2">攻击演进时间线</div>
                  <div class="space-y-2 max-h-44 overflow-auto pr-1">
                    <div v-for="(t, idx) in selectedEvent.timeline" :key="idx" class="flex gap-3 text-sm">
                      <div class="w-20 shrink-0 text-xs text-slate-400">{{ formatTime(t.at) }}</div>
                      <div class="flex-1 text-slate-200">
                        <span class="text-slate-400 mr-2">[{{ t.phase }}]</span>{{ t.message }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 flex gap-2 items-center">
                    <t-input v-model="timelineNote" placeholder="追加处置记录（例如：已封禁来源IP/启用限流）" class="flex-1" />
                    <t-button size="small" theme="primary" variant="outline" @click="appendTimeline">追加</t-button>
                  </div>
                </div>

                <div class="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div class="text-sm text-white font-medium mb-2">IOC/指标</div>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(ioc, idx) in selectedEvent.indicators.slice(0, 12)" :key="idx" class="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-200">
                      {{ ioc }}
                    </span>
                    <span v-if="selectedEvent.indicators.length === 0" class="text-xs text-slate-400">无</span>
                  </div>
                </div>
              </div>

              <div v-if="incidentReport" class="mt-4 bg-white/10 border border-white/10 rounded-lg p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-sm text-white font-semibold">AI处置报告</div>
                    <div class="text-xs text-slate-400">模型：{{ incidentReport.model.provider }} · {{ incidentReport.model.name }} · {{ incidentReport.model.version }}</div>
                  </div>
                  <t-button size="small" variant="outline" @click="incidentReport = null">收起</t-button>
                </div>
                <div class="mt-3 text-sm text-slate-200 whitespace-pre-wrap">{{ incidentReport.summary }}</div>
                <div class="mt-3">
                  <div class="text-sm text-white font-medium">修复建议</div>
                  <ul class="mt-1 text-sm text-slate-200 list-disc list-inside space-y-1">
                    <li v-for="(x, idx) in incidentReport.recommendedFixes" :key="idx">{{ x }}</li>
                  </ul>
                </div>
                <div class="mt-3">
                  <div class="text-sm text-white font-medium">恢复指导</div>
                  <ul class="mt-1 text-sm text-slate-200 list-disc list-inside space-y-1">
                    <li v-for="(x, idx) in incidentReport.recoveryGuide" :key="idx">{{ x }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <div class="flex items-center justify-between">
            <div class="text-white font-semibold">阈值配置</div>
            <t-button size="small" theme="primary" variant="outline" @click="saveThreatConfig" :loading="savingThreatConfig" :disabled="!threatConfigDraft">
              保存
            </t-button>
          </div>
          <div class="mt-3 text-sm text-slate-300">用于动态阈值检测（流量/请求速率/脚本注入特征）。</div>
          <div v-if="threatConfigDraft" class="mt-4 space-y-4">
            <div class="bg-white/5 border border-white/10 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div class="text-sm text-white font-medium">流量（Mbps）</div>
                <t-switch v-model="threatConfigDraft.trafficMbps.enabled" size="small" />
              </div>
              <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <t-input v-model.number="threatConfigDraft.trafficMbps.windowSize" type="number" placeholder="窗口大小" />
                <t-input v-model.number="threatConfigDraft.trafficMbps.multiplier" type="number" placeholder="倍数阈值" />
                <t-input v-model.number="threatConfigDraft.trafficMbps.minAbsThreshold" type="number" placeholder="绝对阈值" />
              </div>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div class="text-sm text-white font-medium">请求速率（rps）</div>
                <t-switch v-model="threatConfigDraft.rps.enabled" size="small" />
              </div>
              <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <t-input v-model.number="threatConfigDraft.rps.windowSize" type="number" placeholder="窗口大小" />
                <t-input v-model.number="threatConfigDraft.rps.multiplier" type="number" placeholder="倍数阈值" />
                <t-input v-model.number="threatConfigDraft.rps.minAbsThreshold" type="number" placeholder="绝对阈值" />
              </div>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div class="text-sm text-white font-medium">脚本注入特征</div>
                <t-switch v-model="threatConfigDraft.scriptInjection.enabled" size="small" />
              </div>
              <div class="mt-3 text-xs text-slate-400">每行一个正则（不含 / /），保存时会自动编译为 i 忽略大小写。</div>
              <t-textarea v-model="scriptPatternDraft" :autosize="{ minRows: 3, maxRows: 8 }" placeholder="例如：<script\\b\nonerror\\s*=\\s*" class="mt-2" />
            </div>
          </div>
          <div v-else class="mt-3 text-sm text-slate-400">正在加载配置...</div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <div class="flex items-center justify-between">
            <div class="text-white font-semibold">告警渠道与历史</div>
            <t-button size="small" theme="primary" variant="outline" @click="saveAlertingConfig" :loading="savingAlertingConfig" :disabled="!alertingConfigDraft">
              保存
            </t-button>
          </div>
          <div v-if="alertingConfigDraft" class="mt-4 space-y-4">
            <div class="grid grid-cols-1 gap-3">
              <div class="bg-white/5 border border-white/10 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-white font-medium">飞书（Webhook）</div>
                  <t-switch v-model="alertingConfigDraft.feishu.enabled" size="small" />
                </div>
                <t-input v-model="alertingConfigDraft.feishu.webhookUrl" class="mt-2" placeholder="Webhook URL（演示字段，不会在前端展示/日志输出）" />
              </div>
              <div class="bg-white/5 border border-white/10 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-white font-medium">企微（Webhook）</div>
                  <t-switch v-model="alertingConfigDraft.wecom.enabled" size="small" />
                </div>
                <t-input v-model="alertingConfigDraft.wecom.webhookUrl" class="mt-2" placeholder="Webhook URL（演示字段，不会在前端展示/日志输出）" />
              </div>
              <div class="bg-white/5 border border-white/10 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-white font-medium">短信（Provider）</div>
                  <t-switch v-model="alertingConfigDraft.sms.enabled" size="small" />
                </div>
                <t-input v-model="alertingConfigDraft.sms.provider" class="mt-2" placeholder="短信服务商（演示字段）" />
              </div>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div class="text-sm text-white font-medium">告警历史</div>
                <t-button size="small" variant="outline" @click="refreshAlertHistory" :loading="alertHistoryLoading">刷新</t-button>
              </div>
              <div class="mt-3 space-y-2 max-h-56 overflow-auto pr-1">
                <div v-for="(a, idx) in alertHistory" :key="idx" class="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex items-center justify-between gap-3">
                    <div class="text-xs text-slate-400">{{ a.occurredAt }}</div>
                    <div class="text-xs px-2 py-0.5 rounded" :class="severityClass(a.severity)">{{ a.channel }}</div>
                  </div>
                  <div class="mt-1 text-sm text-white font-medium truncate">{{ a.title }}</div>
                  <div class="mt-1 text-xs text-slate-300 line-clamp-2">{{ a.content }}</div>
                </div>
                <div v-if="alertHistory.length === 0" class="text-sm text-slate-400">暂无告警历史</div>
              </div>
            </div>
          </div>
          <div v-else class="mt-3 text-sm text-slate-400">正在加载配置...</div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <div class="flex items-center justify-between">
            <div class="text-white font-semibold">复盘与知识沉淀</div>
            <t-button size="small" theme="primary" variant="outline" @click="createPostmortem" :disabled="!selectedEventId">
              创建复盘
            </t-button>
          </div>
          <div class="mt-3 text-sm text-slate-300">选择事件后填写根因与行动项，自动沉淀到知识库。</div>
          <div class="mt-3 space-y-2">
            <t-textarea v-model="rootCause" placeholder="根因分析（必填）" :autosize="{ minRows: 3, maxRows: 6 }" />
            <t-input v-model="actionItem" placeholder="行动项（例如：启用WAF规则集/补齐MFA）" />
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <div class="flex items-center justify-between">
            <div class="text-white font-semibold">风险任务结果</div>
            <div class="flex gap-2">
              <t-button size="small" variant="outline" @click="exportLatestVulnCsv" :disabled="!scanResult">导出漏洞CSV</t-button>
              <t-button size="small" variant="outline" @click="exportLatestComplianceCsv" :disabled="!complianceResult">导出合规CSV</t-button>
            </div>
          </div>
          <div v-if="scanResult" class="mt-3 text-sm text-slate-200">
            <div class="text-xs text-slate-400">漏洞扫描：{{ scanResult.scanId }}（{{ scanResult.startedAt }}）</div>
            <div class="mt-2 space-y-2 max-h-56 overflow-auto pr-1">
              <div v-for="f in scanResult.findings || []" :key="f.id" class="p-3 rounded-lg bg-white/5 border border-white/10">
                <div class="flex items-center justify-between">
                  <div class="text-white text-sm font-medium">{{ f.title }}</div>
                  <span class="text-xs px-2 py-0.5 rounded" :class="severityClass(f.severity)">{{ severityLabel(f.severity) }}</span>
                </div>
                <div class="mt-1 text-xs text-slate-400">{{ f.affectedAsset }} · {{ f.cve || 'NO-CVE' }}</div>
              </div>
            </div>
          </div>
          <div v-if="complianceResult" class="mt-4 text-sm text-slate-200">
            <div class="text-xs text-slate-400">合规评估：{{ complianceResult.assessedAt }}</div>
            <div class="mt-2 space-y-2 max-h-56 overflow-auto pr-1">
              <div v-for="c in complianceResult.controls || []" :key="c.id" class="p-3 rounded-lg bg-white/5 border border-white/10">
                <div class="flex items-center justify-between">
                  <div class="text-white text-sm font-medium">{{ c.name }}</div>
                  <span class="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-200">{{ c.status }}</span>
                </div>
                <div class="mt-1 text-xs text-slate-400">{{ c.id }} · {{ c.requirement }}</div>
              </div>
            </div>
          </div>
          <div v-if="vulnHistory.length > 0" class="mt-4">
            <div class="text-xs text-slate-400 mb-2">最近漏洞扫描</div>
            <div class="space-y-2 max-h-40 overflow-auto pr-1">
              <button
                v-for="x in vulnHistory.slice(0, 8)"
                :key="x.id"
                class="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                @click="loadVulnById(x.id)"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm text-white font-medium">{{ x.scanId }}</div>
                  <div class="text-xs text-slate-400">{{ x.startedAt }}</div>
                </div>
                <div class="mt-1 text-xs text-slate-300">发现：{{ (x.findings || []).length }} 项</div>
              </button>
            </div>
          </div>
          <div v-if="complianceHistory.length > 0" class="mt-4">
            <div class="text-xs text-slate-400 mb-2">最近合规评估</div>
            <div class="space-y-2 max-h-40 overflow-auto pr-1">
              <button
                v-for="x in complianceHistory.slice(0, 8)"
                :key="x.id"
                class="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                @click="loadComplianceById(x.id)"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm text-white font-medium">{{ x.id }}</div>
                  <div class="text-xs text-slate-400">{{ x.assessedAt }}</div>
                </div>
                <div class="mt-1 text-xs text-slate-300">控制项：{{ (x.controls || []).length }} 项</div>
              </button>
            </div>
          </div>
          <div v-if="!scanResult && !complianceResult" class="mt-3 text-sm text-slate-400">暂无结果，可从上方按钮触发。</div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <div class="flex items-center justify-between">
            <div class="text-white font-semibold">安全日报（摘要）</div>
            <div class="flex gap-2">
              <t-button size="small" variant="outline" @click="refreshDailyHistory" :loading="dailyHistoryLoading">历史</t-button>
              <t-button size="small" variant="outline" @click="exportDailyCsv" :disabled="!dailyReport">导出CSV</t-button>
            </div>
          </div>
          <div v-if="dailyReport" class="mt-3 space-y-2 text-sm text-slate-200">
            <div class="text-xs text-slate-400">生成时间：{{ dailyReport.generatedAt }}</div>
            <div class="grid grid-cols-2 gap-2">
              <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                <div class="text-xs text-slate-400">事件总数</div>
                <div class="text-lg text-white font-bold">{{ dailyReport.kpis.totalEvents }}</div>
              </div>
              <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                <div class="text-xs text-slate-400">未闭环</div>
                <div class="text-lg text-white font-bold">{{ dailyReport.kpis.openIncidents }}</div>
              </div>
            </div>
            <div class="mt-2">
              <div class="text-sm text-white font-medium">重点提示</div>
              <ul class="mt-1 list-disc list-inside text-sm text-slate-200 space-y-1">
                <li v-for="(h, idx) in dailyReport.highlights" :key="idx">{{ h }}</li>
              </ul>
            </div>
          </div>
          <div v-if="dailyHistory.length > 0" class="mt-4">
            <div class="text-xs text-slate-400 mb-2">最近日报</div>
            <div class="space-y-2 max-h-44 overflow-auto pr-1">
              <button
                v-for="x in dailyHistory.slice(0, 8)"
                :key="x.id"
                class="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                @click="loadDailyById(x.id)"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm text-white font-medium">{{ x.id }}</div>
                  <div class="text-xs text-slate-400">{{ x.generatedAt }}</div>
                </div>
                <div class="mt-1 text-xs text-slate-300">事件：{{ x.kpis.totalEvents }} · 未闭环：{{ x.kpis.openIncidents }}</div>
              </button>
            </div>
          </div>
          <div v-else class="mt-3 text-sm text-slate-400">点击右上角“生成安全日报”。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FileTextIcon, RefreshCwIcon, ShieldIcon } from 'lucide-vue-next'
import { apiUrl } from '../lib/http'
import {
  type DailySecurityReport,
  type ThreatDetectionConfig,
  type AlertingConfig,
  type AlertMessage,
  type StoredDailySecurityReport,
  type StoredVulnerabilityScan,
  type StoredComplianceAssessment,
  type IncidentReport,
  type SecurityEvent,
  type SecurityEventStatus,
  type SecuritySeverity,
  type SecurityTelemetrySample,
  generateIncidentReport,
  getDailySecurityReport,
  generateDailySecurityReportAndStore,
  getThreatDetectionConfig,
  updateThreatDetectionConfig,
  getAlertingConfig,
  updateAlertingConfig,
  listAlertHistory,
  listDailySecurityReportHistory,
  getDailySecurityReportById,
  listVulnerabilityScanHistory,
  getVulnerabilityScanById,
  listComplianceAssessmentHistory,
  getComplianceAssessmentById,
  listSecurityEvents,
  patchSecurityEvent,
  runComplianceAssessment,
  runVulnerabilityScan,
} from '../lib/securityApi'
import { downloadTextFile, toCsv } from '../lib/utils'

const route = useRoute()
const isMock = ((import.meta as any).env?.VITE_USE_MOCK) !== 'false'

const refreshing = ref(false)
const events = ref<SecurityEvent[]>([])
const selectedEventId = ref<string | null>(null)
const latestTelemetry = ref<SecurityTelemetrySample | null>(null)
const timelineNote = ref('')

const reportLoading = ref(false)
const incidentReport = ref<IncidentReport | null>(null)

const scanLoading = ref(false)
const complianceLoading = ref(false)
const scanResult = ref<any | null>(null)
const complianceResult = ref<any | null>(null)

const dailyLoading = ref(false)
const dailyReport = ref<DailySecurityReport | null>(null)
const dailyHistoryLoading = ref(false)
const dailyHistory = ref<StoredDailySecurityReport[]>([])

const threatConfigDraft = ref<ThreatDetectionConfig | null>(null)
const savingThreatConfig = ref(false)
const scriptPatternDraft = ref('')

const alertingConfigDraft = ref<AlertingConfig | null>(null)
const savingAlertingConfig = ref(false)
const alertHistoryLoading = ref(false)
const alertHistory = ref<AlertMessage[]>([])

const vulnHistory = ref<StoredVulnerabilityScan[]>([])
const complianceHistory = ref<StoredComplianceAssessment[]>([])

const rootCause = ref('')
const actionItem = ref('')

let sse: EventSource | null = null

const selectedEvent = computed(() => events.value.find((e) => e.id === selectedEventId.value) || null)

function severityClass(sev: SecuritySeverity) {
  if (sev === 'critical') return 'bg-red-600 text-white'
  if (sev === 'high') return 'bg-red-500/20 text-red-200 border border-red-500/30'
  if (sev === 'medium') return 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
  if (sev === 'low') return 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
  return 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
}

function severityLabel(sev: SecuritySeverity) {
  const map: Record<SecuritySeverity, string> = { info: '信息', low: '低', medium: '中', high: '高', critical: '严重' }
  return map[sev]
}

function statusLabel(status: SecurityEventStatus) {
  const map: Record<SecurityEventStatus, string> = { open: '已立案', investigating: '处置中', mitigated: '已缓解', resolved: '已恢复' }
  return map[status]
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch (_) {
    return iso
  }
}

function formatPct(v: number | undefined | null) {
  if (typeof v !== 'number') return '-'
  return `${(v * 100).toFixed(2)}%`
}

function selectEvent(id: string) {
  selectedEventId.value = id
  incidentReport.value = null
}

async function refreshEvents() {
  events.value = await listSecurityEvents(200)
  if (!selectedEventId.value && events.value.length > 0) {
    selectedEventId.value = events.value[0].id
  }
}

async function refreshAll() {
  refreshing.value = true
  try {
    await refreshEvents()
  } finally {
    refreshing.value = false
  }
}

async function advanceProgress(delta: number) {
  const e = selectedEvent.value
  if (!e) return
  const next = Math.min(100, Math.max(0, e.recoveryProgress + delta))
  const updated = await patchSecurityEvent(e.id, { recoveryProgress: next })
  if (!updated) return
  events.value = events.value.map((x) => (x.id === updated.id ? updated : x))
}

async function setStatus(status: SecurityEventStatus) {
  const e = selectedEvent.value
  if (!e) return
  const updated = await patchSecurityEvent(e.id, { status })
  if (!updated) return
  events.value = events.value.map((x) => (x.id === updated.id ? updated : x))
}

async function appendTimeline() {
  const e = selectedEvent.value
  const note = timelineNote.value.trim()
  if (!e || note.length === 0) return
  const updated = await patchSecurityEvent(e.id, { timelineAppend: note })
  if (!updated) return
  timelineNote.value = ''
  events.value = events.value.map((x) => (x.id === updated.id ? updated : x))
}

async function generateReport() {
  const e = selectedEvent.value
  if (!e) return
  reportLoading.value = true
  try {
    incidentReport.value = await generateIncidentReport(e.id)
  } finally {
    reportLoading.value = false
  }
}

async function runVulnScan() {
  scanLoading.value = true
  try {
    scanResult.value = await runVulnerabilityScan()
    await refreshVulnHistory()
  } finally {
    scanLoading.value = false
  }
}

async function runCompliance() {
  complianceLoading.value = true
  try {
    complianceResult.value = await runComplianceAssessment()
    await refreshComplianceHistory()
  } finally {
    complianceLoading.value = false
  }
}

async function openDailyReport() {
  dailyLoading.value = true
  try {
    dailyReport.value = (await generateDailySecurityReportAndStore()) || (await getDailySecurityReport())
    await refreshDailyHistory()
  } finally {
    dailyLoading.value = false
  }
}

async function refreshDailyHistory() {
  dailyHistoryLoading.value = true
  try {
    dailyHistory.value = await listDailySecurityReportHistory(30)
  } finally {
    dailyHistoryLoading.value = false
  }
}

async function loadDailyById(id: string) {
  const item = await getDailySecurityReportById(id)
  if (item) dailyReport.value = item
}

async function refreshThreatConfig() {
  const cfg = await getThreatDetectionConfig()
  if (!cfg) return
  threatConfigDraft.value = cfg
  scriptPatternDraft.value = (cfg.scriptInjection.patterns || []).join('\n')
}

async function saveThreatConfig() {
  if (!threatConfigDraft.value) return
  savingThreatConfig.value = true
  try {
    const patterns = scriptPatternDraft.value
      .split('\n')
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
    const patch: Partial<ThreatDetectionConfig> = {
      ...threatConfigDraft.value,
      scriptInjection: { ...threatConfigDraft.value.scriptInjection, patterns },
    }
    const saved = await updateThreatDetectionConfig(patch)
    if (saved) {
      await refreshThreatConfig()
    }
  } finally {
    savingThreatConfig.value = false
  }
}

async function refreshAlertingConfig() {
  const cfg = await getAlertingConfig()
  if (!cfg) return
  alertingConfigDraft.value = cfg
}

async function saveAlertingConfig() {
  if (!alertingConfigDraft.value) return
  savingAlertingConfig.value = true
  try {
    const saved = await updateAlertingConfig(alertingConfigDraft.value)
    if (saved) {
      await refreshAlertingConfig()
      await refreshAlertHistory()
    }
  } finally {
    savingAlertingConfig.value = false
  }
}

async function refreshAlertHistory() {
  alertHistoryLoading.value = true
  try {
    alertHistory.value = await listAlertHistory(100)
  } finally {
    alertHistoryLoading.value = false
  }
}

async function refreshVulnHistory() {
  vulnHistory.value = await listVulnerabilityScanHistory(30)
}

async function refreshComplianceHistory() {
  complianceHistory.value = await listComplianceAssessmentHistory(30)
}

async function loadVulnById(id: string) {
  const item = await getVulnerabilityScanById(id)
  if (item) scanResult.value = item
}

async function loadComplianceById(id: string) {
  const item = await getComplianceAssessmentById(id)
  if (item) complianceResult.value = item
}

function exportEventsCsv() {
  const headers = ['id', 'timestamp', 'severity', 'status', 'title', 'recoveryProgress', 'description']
  const rows = events.value.map((e) => [e.id, e.timestamp, e.severity, e.status, e.title, e.recoveryProgress, e.description])
  downloadTextFile(`security_events_${Date.now()}.csv`, toCsv(headers, rows), 'text/csv;charset=utf-8')
}

function exportDailyCsv() {
  const r = dailyReport.value
  if (!r) return
  const headers = ['kpi', 'value']
  const rows = Object.entries(r.kpis || {}).map(([k, v]) => [k, v])
  downloadTextFile(`daily_report_${Date.now()}.csv`, toCsv(headers, rows), 'text/csv;charset=utf-8')
}

function exportLatestVulnCsv() {
  if (!scanResult.value) return
  const headers = ['id', 'severity', 'title', 'affectedAsset', 'cve']
  const rows = (scanResult.value.findings || []).map((f: any) => [f.id, f.severity, f.title, f.affectedAsset, f.cve || ''])
  downloadTextFile(`vuln_scan_${scanResult.value.scanId}_${Date.now()}.csv`, toCsv(headers, rows), 'text/csv;charset=utf-8')
}

function exportLatestComplianceCsv() {
  if (!complianceResult.value) return
  const headers = ['id', 'name', 'status', 'requirement']
  const rows = (complianceResult.value.controls || []).map((c: any) => [c.id, c.name, c.status, c.requirement])
  downloadTextFile(`compliance_${Date.now()}.csv`, toCsv(headers, rows), 'text/csv;charset=utf-8')
}

async function createPostmortem() {
  const eventId = selectedEventId.value
  const rc = rootCause.value.trim()
  if (!eventId || rc.length === 0) return

  await fetch(apiUrl('/api/security/postmortems'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId,
      rootCause: rc,
      timeline: [{ at: new Date().toISOString(), note: '复盘创建' }],
      whatWentWell: ['检测与告警链路正常'],
      whatWentWrong: ['基线与阈值仍需优化'],
      actionItems: [
        {
          owner: 'SecOps',
          item: actionItem.value.trim() || '补齐处置剧本与自动化动作',
          dueAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          status: 'open',
        },
      ],
    }),
  })

  rootCause.value = ''
  actionItem.value = ''
}

function initSecurityStream() {
  try {
    sse = new EventSource(apiUrl('/api/security/stream'))
    sse.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data || '{}')
        if (payload?.kind === 'telemetry') {
          latestTelemetry.value = payload.data
        } else if (payload?.kind === 'event_created') {
          const e: SecurityEvent = payload.data
          events.value = [e, ...events.value.filter((x) => x.id !== e.id)].slice(0, 200)
          if (!selectedEventId.value) selectedEventId.value = e.id
        } else if (payload?.kind === 'event_updated') {
          const e: SecurityEvent = payload.data
          events.value = events.value.map((x) => (x.id === e.id ? e : x))
        } else if (payload?.kind === 'snapshot') {
          const snapshot = payload.data
          if (Array.isArray(snapshot?.events)) events.value = snapshot.events
        }
      } catch (_) {}
    }
  } catch (_) {}
}

onMounted(async () => {
  await refreshAll()
  if (!isMock) initSecurityStream()
  await Promise.all([refreshThreatConfig(), refreshAlertingConfig(), refreshAlertHistory(), refreshDailyHistory(), refreshVulnHistory(), refreshComplianceHistory()])
})

onBeforeUnmount(() => {
  try {
    sse?.close()
  } catch (_) {}
  sse = null
})

watch(
  () => route.query.eventId,
  (v) => {
    if (typeof v === 'string' && v.trim().length > 0) {
      selectEvent(v)
    }
  },
  { immediate: true },
)
</script>
