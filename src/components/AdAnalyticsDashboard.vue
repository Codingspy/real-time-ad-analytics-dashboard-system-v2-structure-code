<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Real-time Ad Analytics Dashboard</h1>
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div :class="connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'" 
               class="w-3 h-3 rounded-full mr-2"></div>
          <span class="text-sm text-gray-600">
            {{ connectionStatus === 'connected' ? 'Live Data' : 'Disconnected' }}
          </span>
        </div>
        <div class="text-sm text-gray-500">
          Last updated: {{ lastUpdated }}
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Impressions"
        :value="metrics.totalImpressions"
        :change="metrics.impressionsChange"
        icon="👁️"
        color="blue"
      />
      <MetricCard
        title="Total Clicks"
        :value="metrics.totalClicks"
        :change="metrics.clicksChange"
        icon="👆"
        color="green"
      />
      <MetricCard
        title="Conversions"
        :value="metrics.totalConversions"
        :change="metrics.conversionsChange"
        icon="🎯"
        color="purple"
      />
      <MetricCard
        title="CTR"
        :value="metrics.ctr + '%'"
        :change="metrics.ctrChange"
        icon="📊"
        color="orange"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Real-time Activity Chart -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Real-time Activity</h3>
        <canvas ref="realtimeChart" class="w-full h-64"></canvas>
      </div>

      <!-- Conversion Funnel -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div class="space-y-4">
          <FunnelStep
            label="Impressions"
            :value="metrics.totalImpressions"
            :percentage="100"
            color="bg-blue-500"
          />
          <FunnelStep
            label="Clicks"
            :value="metrics.totalClicks"
            :percentage="(metrics.totalClicks / metrics.totalImpressions * 100)"
            color="bg-green-500"
          />
          <FunnelStep
            label="Conversions"
            :value="metrics.totalConversions"
            :percentage="(metrics.totalConversions / metrics.totalImpressions * 100)"
            color="bg-purple-500"
          />
        </div>
      </div>
    </div>

    <!-- Detailed Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Campaign Performance -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Campaigns</h3>
        <div class="space-y-3">
          <CampaignItem
            v-for="campaign in topCampaigns"
            :key="campaign.id"
            :campaign="campaign"
          />
        </div>
      </div>

      <!-- Geographic Distribution -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
        <canvas ref="geoChart" class="w-full h-48"></canvas>
      </div>

      <!-- Device Breakdown -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
        <canvas ref="deviceChart" class="w-full h-48"></canvas>
      </div>
    </div>

    <!-- Real-time Event Log -->
    <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Live Event Stream</h3>
      <div class="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
        <div
          v-for="event in recentEvents"
          :key="event.id"
          class="text-sm font-mono mb-2"
          :class="getEventColor(event.type)"
        >
          <span class="text-gray-400">[{{ formatTime(event.timestamp) }}]</span>
          <span class="ml-2">{{ event.type.toUpperCase() }}</span>
          <span class="ml-2 text-gray-300">{{ event.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'

// Reactive data
const connectionStatus = ref('disconnected')
const lastUpdated = ref(new Date().toLocaleTimeString())
const realtimeChart = ref(null)
const geoChart = ref(null)
const deviceChart = ref(null)

// Metrics data
const metrics = ref({
  totalImpressions: 1250000,
  totalClicks: 45600,
  totalConversions: 2340,
  ctr: 3.65,
  impressionsChange: 12.5,
  clicksChange: 8.3,
  conversionsChange: 15.2,
  ctrChange: -2.1
})

// Campaign data
const topCampaigns = ref([
  { id: 1, name: 'Summer Sale 2024', clicks: 12500, conversions: 450, ctr: 3.6 },
  { id: 2, name: 'Mobile App Promo', clicks: 8900, conversions: 320, ctr: 3.2 },
  { id: 3, name: 'Holiday Special', clicks: 7600, conversions: 280, ctr: 2.8 },
  { id: 4, name: 'Brand Awareness', clicks: 6200, conversions: 180, ctr: 2.4 }
])

// Real-time events
const recentEvents = ref([])

// WebSocket connection
let ws = null
let realtimeChartInstance = null
let geoChartInstance = null
let deviceChartInstance = null

// Chart data
const realtimeData = ref({
  labels: [],
  clicks: [],
  conversions: []
})

onMounted(() => {
  initializeCharts()
  connectWebSocket()
  startDataSimulation()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
  if (realtimeChartInstance) realtimeChartInstance.destroy()
  if (geoChartInstance) geoChartInstance.destroy()
  if (deviceChartInstance) deviceChartInstance.destroy()
})

function initializeCharts() {
  // Real-time activity chart
  const ctx1 = realtimeChart.value.getContext('2d')
  realtimeChartInstance = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Clicks',
          data: [],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4
        },
        {
          label: 'Conversions',
          data: [],
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  })

  // Geographic chart
  const ctx2 = geoChart.value.getContext('2d')
  geoChartInstance = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['USA', 'UK', 'Germany', 'France', 'Others'],
      datasets: [{
        data: [35, 20, 15, 12, 18],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })

  // Device chart
  const ctx3 = deviceChart.value.getContext('2d')
  deviceChartInstance = new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: ['Desktop', 'Mobile', 'Tablet'],
      datasets: [{
        label: 'Clicks',
        data: [18500, 22100, 5000],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

function connectWebSocket() {
  // Simulate WebSocket connection to your ELK stack backend
  // In production, this would connect to your actual WebSocket endpoint
  connectionStatus.value = 'connected'
  
  // Simulate real-time data updates
  setInterval(() => {
    updateRealtimeData()
    addRealtimeEvent()
    lastUpdated.value = new Date().toLocaleTimeString()
  }, 2000)
}

function updateRealtimeData() {
  const now = new Date()
  const timeLabel = now.toLocaleTimeString()
  
  // Add new data point
  realtimeData.value.labels.push(timeLabel)
  realtimeData.value.clicks.push(Math.floor(Math.random() * 100) + 50)
  realtimeData.value.conversions.push(Math.floor(Math.random() * 10) + 2)
  
  // Keep only last 20 data points
  if (realtimeData.value.labels.length > 20) {
    realtimeData.value.labels.shift()
    realtimeData.value.clicks.shift()
    realtimeData.value.conversions.shift()
  }
  
  // Update chart
  realtimeChartInstance.data.labels = realtimeData.value.labels
  realtimeChartInstance.data.datasets[0].data = realtimeData.value.clicks
  realtimeChartInstance.data.datasets[1].data = realtimeData.value.conversions
  realtimeChartInstance.update('none')
}

function addRealtimeEvent() {
  const eventTypes = ['click', 'conversion', 'impression', 'error']
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
  
  const event = {
    id: Date.now(),
    type: eventType,
    timestamp: new Date(),
    message: generateEventMessage(eventType)
  }
  
  recentEvents.value.unshift(event)
  
  // Keep only last 50 events
  if (recentEvents.value.length > 50) {
    recentEvents.value.pop()
  }
}

function generateEventMessage(type) {
  const messages = {
    click: `User clicked ad campaign #${Math.floor(Math.random() * 1000)} from ${getRandomLocation()}`,
    conversion: `Conversion tracked for campaign #${Math.floor(Math.random() * 1000)} - $${(Math.random() * 100).toFixed(2)}`,
    impression: `Ad impression served to ${getRandomDevice()} user in ${getRandomLocation()}`,
    error: `Failed to track event - retrying... (Error: ${Math.floor(Math.random() * 500)})`
  }
  return messages[type]
}

function getRandomLocation() {
  const locations = ['New York', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sydney']
  return locations[Math.floor(Math.random() * locations.length)]
}

function getRandomDevice() {
  const devices = ['desktop', 'mobile', 'tablet']
  return devices[Math.floor(Math.random() * devices.length)]
}

function startDataSimulation() {
  // Simulate periodic metric updates
  setInterval(() => {
    metrics.value.totalImpressions += Math.floor(Math.random() * 100)
    metrics.value.totalClicks += Math.floor(Math.random() * 10)
    metrics.value.totalConversions += Math.floor(Math.random() * 3)
    metrics.value.ctr = ((metrics.value.totalClicks / metrics.value.totalImpressions) * 100).toFixed(2)
  }, 5000)
}

function getEventColor(type) {
  const colors = {
    click: 'text-green-400',
    conversion: 'text-purple-400',
    impression: 'text-blue-400',
    error: 'text-red-400'
  }
  return colors[type] || 'text-gray-400'
}

function formatTime(timestamp) {
  return timestamp.toLocaleTimeString()
}
</script>

<!-- Metric Card Component -->
<template>
<div class="bg-white rounded-lg shadow-sm p-6">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-gray-600">{{ title }}</p>
      <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
    </div>
    <div class="text-2xl">{{ icon }}</div>
  </div>
  <div class="mt-4 flex items-center">
    <span 
      :class="change >= 0 ? 'text-green-600' : 'text-red-600'"
      class="text-sm font-medium"
    >
      {{ change >= 0 ? '+' : '' }}{{ change }}%
    </span>
    <span class="text-sm text-gray-500 ml-2">vs last period</span>
  </div>
</div>
</template>

<script>
// MetricCard component would be defined here
</script>

<!-- Funnel Step Component -->
<template>
<div class="flex items-center">
  <div class="flex-1">
    <div class="flex justify-between items-center mb-1">
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span class="text-sm text-gray-500">{{ value.toLocaleString() }}</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div 
        :class="color"
        class="h-2 rounded-full transition-all duration-300"
        :style="{ width: percentage + '%' }"
      ></div>
    </div>
    <div class="text-xs text-gray-500 mt-1">{{ percentage.toFixed(1) }}%</div>
  </div>
</div>
</template>

<!-- Campaign Item Component -->
<template>
<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
  <div>
    <p class="font-medium text-gray-900">{{ campaign.name }}</p>
    <p class="text-sm text-gray-500">{{ campaign.clicks.toLocaleString() }} clicks</p>
  </div>
  <div class="text-right">
    <p class="font-medium text-gray-900">{{ campaign.conversions }}</p>
    <p class="text-sm text-gray-500">{{ campaign.ctr }}% CTR</p>
  </div>
</div>
</template>
