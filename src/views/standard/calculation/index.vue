<template>
  <div class="main">
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
          <template #header>
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
                :type="getStatusType(project.projectStatus)"
                effect="dark"
                class="status-tag"
              >
                {{ formatStatus(project.projectStatus) }}
              </el-tag>
            </div>
          </template>
          
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <el-icon><Document /></el-icon>
                <span class="label">调整后功能点为：{{ project.DFP }}</span>
				
                <span class="value" v-if="project.DFP !== null">{{ project.DFP }}</span>
				
                <el-skeleton v-else animated :rows="1" />
				
              </div>
            </div>
          </div>
        </el-card>
      </el-radio-group>
    </div>

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
import { ref, onMounted,reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Close, Document } from '@element-plus/icons-vue'
import { listFeats, getProjectDFP } from '@/api/system/assessmentResult'

const router = useRouter()
const query = ref('')
const projects = ref([])
const selectedProjectId = ref(null)

const getStatusType = (status) => {
  const types = {
    0: 'warning',  // 待评估
    1: 'info',     // 待审核
    2: 'success',  // 完成
    3: 'warning'   // 待计算
  }
  return types[status] || 'info'
}

const formatStatus = (status) => {
  const statusMap = {
    0: '待评估',
    1: '待审核',
    2: '完成',
    3: '待计算'
  }
  return statusMap[status] || '未知状态'
}

const toggleSelection = (projectId) => {
  selectedProjectId.value = selectedProjectId.value === projectId ? null : projectId
}

// 在 script 部分添加
const fetchProjects = async () => {
  try {
    const response = await listFeats({ name: query.value })
    const projectsWithDFP = await Promise.all(response.data.map(async (project) => {
      try {
        const dfpResponse = await getProjectDFP(project.projectId)
        return { ...project, DFP: dfpResponse.data }
      } catch (error) {
        return { ...project, DFP: null }
      }
    }))
    projects.value = projectsWithDFP
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  }
}

const startEvaluation = () => {
  if (selectedProjectId.value) {
    router.push({
      path: '/standards/choose-standard',
      query: { projectId: selectedProjectId.value }
    })
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.main {
  padding: 24px;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
  min-height: 100vh;
}

.search-wrapper {
  max-width: 600px;
  margin: 0 auto 32px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper):hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.card-container {
  max-width: 1200px;
  margin: 0 auto;
}

.project-radio-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  width: 100%;
}

.project-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.project-card.selected {
  border: 2px solid #409EFF;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: transparent;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.info-grid {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.info-item .el-icon {
  font-size: 20px;
  color: #409EFF;
}

.label {
  color: #64748b;
  font-size: 14px;
  flex: 1;
}

.value {
  font-weight: 600;
  color: #1e293b;
}

.status-tag {
  border-radius: 6px;
  padding: 4px 12px;
  font-weight: 500;
}

.evaluate-button {
  width: 300px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 24px;
  margin-top: 40px;
  background: linear-gradient(135deg, #409EFF, #1890ff);
  border: none;
  transition: all 0.3s ease;
}

.evaluate-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(64, 158, 255, 0.3);
}

.action-section {
  text-align: center;
}

@media (max-width: 768px) {
  .main {
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