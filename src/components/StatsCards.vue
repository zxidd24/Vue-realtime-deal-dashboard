<template>
  <div class="stats-cards" v-if="showStats">
    <div class="stat-card">
      <i class="fas fa-list card-total"></i>
      <div class="stat-value">{{ totalRecords }}</div>
      <div class="stat-label">总记录数</div>
    </div>
    <div class="stat-card">
      <i class="fas fa-tags card-categories"></i>
      <div class="stat-value">{{ totalCategories }}</div>
      <div class="stat-label">项目类别</div>
    </div>
    <div class="stat-card">
      <i class="fas fa-yen-sign card-amount"></i>
      <div class="stat-value">{{ formattedTotalAmount }}</div>
      <div class="stat-label">总成交金额(元)</div>
    </div>
    <div class="stat-card">
      <i class="fas fa-handshake card-count"></i>
      <div class="stat-value">{{ totalCount }}</div>
      <div class="stat-label">总成交笔数</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '../stores/dashboard'

const store = useDashboardStore()

// 计算属性
const showStats = computed(() => store.totalRecords > 0)
const totalRecords = computed(() => store.totalRecords)
const totalCategories = computed(() => store.totalCategories)
const totalAmount = computed(() => store.totalAmount)
const totalCount = computed(() => store.totalCount)

const formattedTotalAmount = computed(() => {
  return totalAmount.value.toFixed(2)
})
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin: 45px 35px 20px 35px;
}

.stat-card {
  background: #e3f2fd;
  padding: 18px;
  border-radius: 14px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card i {
  font-size: 1.8em;
  margin-bottom: 10px;
}

.stat-card .stat-value {
  font-size: 1.6em;
  font-weight: bold;
  margin-bottom: 2px;
}

.stat-card .stat-label {
  color: #6c757d;
  font-size: 0.85em;
}

.card-total { color: #0288d1; }
.card-categories { color: #039be5; }
.card-amount { color: #00bcd4; }
.card-count { color: #4fc3f7; }

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
    margin: 30px 20px 15px 20px;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-card .stat-value {
    font-size: 1.4em;
  }
}
</style>
