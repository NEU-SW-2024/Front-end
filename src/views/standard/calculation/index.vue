<template>
  <div class="main">
    <!-- 搜索框部分 -->
    <div class="search-wrapper">
      <el-input 
        v-model="query" 
        placeholder="搜索项目" 
        class="search-input"
        @keyup.enter="fetchProjects"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button type="primary" @click="fetchProjects">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 卡片容器 -->
    <div class="card-container">
      <el-radio-group v-model="selectedProjectId" class="project-radio-group">
        <el-card 
          v-for="project in projects" 
          :key="project.projectId" 
          class="project-card" 
          :class="{ 'selected': selectedProjectId === project.projectId }"
          shadow="hover"
          @click="toggleSelection(project.projectId)"
        >
          <div class="card-content">
            <!-- 卡片标题区 -->
            <div class="card-header">
              <div class="header-left">
                <el-radio :label="project.projectId" class="project-radio">
                  <h3 class="card-title">{{ project.name }}</h3>
                </el-radio>
                <el-button 
                  v-if="selectedProjectId === project.projectId"
                  type="text" 
                  class="clear-selection"
                  @click.stop="selectedProjectId = null"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              <el-tag 
                :type="getStatusType(project.status)"
                class="status-tag"
              >
                {{ formatStatus(project.status) }}
              </el-tag>
            </div>
            
            <!-- 卡片主体区 -->
            <div class="card-body">
              
              <div class="card-body">
                <div class="info-item">
                  <span class="label">调整后功能点</span>
                  <span class="value">{{ project.DFP || '待评估' }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-radio-group>
    </div>

    <!-- 开始评估按钮 -->
    <div class="action-section">
      <el-button 
        type="primary"
        size="large"
        class="evaluate-button"
        :disabled="!selectedProjectId"
        @click="startEvaluation"
      >
        开始评估
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Close } from '@element-plus/icons-vue'
import { listFeats } from '@/api/system/assessmentResult'

const router = useRouter()
const query = ref('')
const projects = ref([])
const selectedProjectId = ref(null)

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    0: 'warning',  // 待评估
    1: 'info',     // 待审核
    2: 'success'   // 完成
  }
  return types[status] || ''
}

// 格式化状态文本
const formatStatus = (status) => {
  const statusMap = {
    0: '待评估',
    1: '待审核',
    2: '已完成'
  }
  return statusMap[status] || '未知状态'
}

// 切换选中状态
const toggleSelection = (projectId) => {
  selectedProjectId.value = selectedProjectId.value === projectId ? null : projectId
}

// 获取项目列表
const fetchProjects = async () => {
  try {
    const response = await listFeats({ name: query.value })
    projects.value = response.data
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  }
}

// 开始评估，跳转到标准选择页面
const startEvaluation = () => {
  if (selectedProjectId.value) {
    router.push({
      path: '/standards/choose-standard',
      query: { projectId: selectedProjectId.value }
    })
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.main {
  padding: 24px 0;  /* 修改为上下padding */
  margin: 0; /* 确保没有margin */
  background: #f5f7fa;
  min-height: 100vh;
  width: 100%; /* 添加宽度100% */
}

/* 搜索框样式 */
.search-wrapper {
  max-width: 600px;
  margin: 0 auto 32px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.card-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.project-radio-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* 稍微减小最小宽度 */
    gap: 16px; /* 减小间距 */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.project-card {
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.1);
}

.project-card.selected {
  border: 2px solid #409EFF;
  box-shadow: 0 8px 16px 0 rgba(64,158,255,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-radio {
  margin-right: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
  display: inline;
}

.card-body {
  padding: 16px;
  background: white;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.label {
  color: #606266;
  font-size: 14px;
}

.value {
  font-weight: 500;
  color: #2c3e50;
}

.clear-selection {
  margin-left: 8px;
  padding: 2px;
  color: #909399;
}

.clear-selection:hover {
  color: #F56C6C;
}

.status-tag {
  font-size: 12px;
  padding: 0 8px;
}

/* 评估按钮样式 */
.action-section {
  margin-top: 32px;
  text-align: center;
}

.evaluate-button {
  width: 300px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.evaluate-button:not(:disabled) {
  background: linear-gradient(135deg, #409EFF, #1890ff);
}

.evaluate-button:not(:disabled):hover {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64,158,255,0.3);
}

@media (max-width: 768px) {
  .main-container {
    padding: 16px;
  }
  
  .project-radio-group {
    grid-template-columns: 1fr;
  }
  
  .evaluate-button {
    width: 100%;
  }
}
</style>