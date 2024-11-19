<template>
  <div class="main-container">
    <!-- 搜索框部分 -->
    <div class="search-wrapper">
      <el-input 
        v-model="searchQuery" 
        placeholder="搜索项目" 
        class="search-input"
        @keyup.enter="performSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button type="primary" @click="performSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 卡片容器 -->
    <div class="card-container">
      <el-radio-group v-model="selectedProjectId" class="project-radio-group">
        <el-card 
          v-for="project in filteredProjects" 
          :key="project.id" 
          class="project-card" 
          :class="{ 'selected': selectedProjectId === project.id }"
          shadow="hover"
          @click="toggleSelection(project.id)"
        >
          <div class="card-content">
            <!-- 卡片标题区 -->
			<div class="card-header">
				<div class="header-left">
				  <el-radio :label="project.id" class="project-radio">
				    <h3 class="card-title">{{ project.name }}</h3>
				  </el-radio>
				  <el-button 
				    v-if="selectedProjectId === project.id"
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
				    {{ project.status }}
				  </el-tag>
			</div>
            
            
            <!-- 卡片主体区 -->
            <div class="card-body">
              <p class="card-description">{{ decodeBase64Text(project.description.text) }}</p>
              <img 
                v-if="project.description.image && project.description.image.trim() !== ''" 
                :src="'./images/neu_logo_l.jpg'" 
                alt="项目图片" 
                class="card-image" 
              />
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
        开始造价评估
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search , Close} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const selectedProjectId = ref(null)

const projects = [
  {
    id: 1,
    name: '项目一',
    status: '待评估',
    description: {
      text: '5ZWG5oiQ',
      image: ''
    }
  },
  {
    id: 2,
    name: '项目二',
    status: '已完成',
    description: {
      text: '6YeM5oiQ',
      image: ''
    }
  },
]

const filteredProjects = ref(projects)

const decodeBase64Text = (base64Text) => {
  try {
    const binaryString = atob(base64Text)
    const utf8Text = decodeURIComponent(
      Array.from(binaryString)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    )
    return utf8Text
  } catch (error) {
    console.error('解码失败：', error)
    return '无法显示内容'
  }
}

const toggleSelection = (projectId) => {
  selectedProjectId.value = selectedProjectId.value === projectId ? null : projectId
}

const getStatusType = (status) => {
  return status === '待评估' ? 'warning' : status === '已完成' ? 'success' : ''
}

const performSearch = () => {
  if (!searchQuery.value.trim()) {
    filteredProjects.value = projects
    return
  }
  
  filteredProjects.value = projects.filter((project) => {
    const projectName = project.name.toLowerCase()
    const searchTerm = searchQuery.value.toLowerCase()
    const decodedDescription = decodeBase64Text(project.description.text).toLowerCase()
    return projectName.includes(searchTerm) || decodedDescription.includes(searchTerm)
  })
}

const startEvaluation = () => {
  if (selectedProjectId.value) {
    router.push('/evaluation')
  }
}

onMounted(() => {
  filteredProjects.value = projects
})
</script>

<style scoped>
	
	
.clear-selection {
  margin-left: 8px;
  padding: 2px;
  color: #909399;
}

.clear-selection:hover {
  color: #F56C6C;
}


.main-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
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
  padding: 0 24px; /* 添加左右内边距 */
}

.project-radio-group {
  display: grid;
  /* 修改网格布局，使其更合理地分配空间 */
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  width: 100%;
  /* 确保卡片在较大屏幕上不会过度拉伸 */
  max-width: 1200px;
  margin: 0 auto;
}

/* 为卡片添加最大宽度限制 */
.project-card {
  max-width: 480px; /* 限制单个卡片的最大宽度 */
  margin: 0 auto; /* 使卡片在其网格区域内居中 */
  width: 100%;
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

.card-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
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