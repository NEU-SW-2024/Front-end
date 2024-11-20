<template>
  <div class="assessment-results">
    <!-- 页面头部 -->
    <header class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="24">
          <div class="search-container">
            <el-input
              v-model="query"
              placeholder="输入项目ID搜索..."
              clearable
              :prefix-icon="Search"
            >
              <template #append>
                <el-button type="primary" @click="fetchResults">
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>
        </el-col>
      </el-row>
    </header>

    <!-- 评估结果卡片列表 -->
    <section class="card-section">
      <el-row :gutter="20">
        <el-col 
          :xs="24" 
          :sm="12" 
          :md="8" 
          v-for="result in results" 
          :key="result.resId"
        >
          <el-card class="result-card" :body-style="{ padding: '0px' }">
            <div class="card-header">
              <h3 class="card-title">项目 #{{ result.projectId }}</h3>
              <div class="card-actions">
                <el-button
                  type="danger"
                  circle
                  size="small"
                  class="delete-button"
                  :icon="Delete"
                  @click.stop="confirmDelete(result.resId)"
                />
              </div>
            </div>
            
            <div class="card-content">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">评估标准ID</span>
                  <span class="value">{{ result.stdId }}</span>
                </div>
                <div class="info-item">
                  <span class="label">开发服务费用</span>
                  <span class="value">￥{{ formatNumber(result.projectSDC) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">调整后费用</span>
                  <span class="value">￥{{ formatNumber(result.projectESDC) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">创建时间</span>
                  <span class="value">{{ formatDate(result.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <el-button 
                type="primary" 
                class="detail-button"
                @click="viewDetail(result.resId)"
              >
                查看详情
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete } from '@element-plus/icons-vue'
import { listAssessmentResults, delAssessmentResult } from '@/api/system/assessmentResult'

const router = useRouter()
const query = ref('')
const results = ref([])

// 格式化数字为金额格式
const formatNumber = (num) => {
  return num ? num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) : '0.00'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取评估结果列表
const fetchResults = async () => {
  try {
    const response = await listAssessmentResults({ projectId: query.value })
    results.value = response.data
  } catch (error) {
    ElMessage.error('获取评估结果列表失败')
  }
}

// 删除评估结果
const confirmDelete = (resId) => {
  ElMessageBox.confirm(
    '确定要删除该评估结果吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await delAssessmentResult(resId)
        ElMessage.success('删除成功')
        fetchResults()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 查看详情
const viewDetail = (resId) => {
  router.push(`/standards/result-detail/${resId}`)
}

// 页面加载时获取数据
onMounted(() => {
  fetchResults()
})
</script>

<style scoped>
.assessment-results {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  margin-bottom: 24px;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.card-section {
  margin-top: 24px;
}

.card-section .el-row {
  margin-bottom: 24px;
}

.card-section .el-row:last-child {
  margin-bottom: 0;
}

.result-card {
  height: 100%;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 4px 12px 0 rgba(0,0,0,0.05);
  margin-bottom: 24px;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.1);
}

.card-header {
  padding: 16px;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.delete-button {
  font-size: 18px;
}

.card-content {
  padding: 16px;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}

.label {
  color: #606266;
  font-size: 14px;
}

.value {
  font-weight: 500;
  color: #2c3e50;
}

.card-footer {
  padding: 16px;
  background: #f8f9fa;
  text-align: right;
}

.detail-button {
  width: 100%;
}
</style>