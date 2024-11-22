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

    <!-- 批量操作工具栏 -->
    <div class="batch-toolbar" v-show="results.length">
      <el-checkbox
        v-model="isAllSelected"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
      >
        全选
      </el-checkbox>
      <el-button
        type="danger"
        :disabled="!selectedIds.length"
        @click="confirmBatchDelete"
      >
        批量删除
      </el-button>
      <span class="selected-count" v-if="selectedIds.length">
        已选择 {{ selectedIds.length }} 项
      </span>
    </div>

    <section class="card-section">
          <el-row :gutter="20">
            <el-col 
              :xs="24" 
              :sm="12" 
              :md="8" 
              v-for="result in results" 
              :key="result.resId"
            >
              <el-card 
                class="result-card" 
                :body-style="{ padding: '0px' }"
                :class="{ 'is-selected': selectedIds.includes(result.resId) }"
              >
                <div class="card-selection">
                  <el-checkbox
                    v-model="result.isSelected"
                    @change="(val) => handleSelectChange(val, result.resId)"
                  />
                </div>
                <div class="card-header">
                  <div class="title-section">
                    <h3 class="card-title">{{ projectNames[result.projectId] || '未知项目' }}</h3>
                    <div class="standard-name">{{ standardNames[result.stdId] || '加载中...' }}</div>
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete } from '@element-plus/icons-vue'
import { listAssessmentResults, delAssessmentResult, getProjectName } from '@/api/system/assessmentResult'
import { getStandardById } from '@/api/system/assessmentStandard'


const router = useRouter()
const query = ref('')
const results = ref([])
const selectedIds = ref([])
const projectNames = ref({}) // 用于存储项目ID和名称的映射
const standardNames = ref({}) // Store standard names


const loadStandardName = async (stdId) => {
  try {
    const response = await getStandardById(stdId)
    standardNames.value[stdId] = response.data.stdName
  } catch (error) {
    standardNames.value[stdId] = '未知标准'
  }
}

// 计算全选和半选状态
const isAllSelected = computed(() => {
  return results.value.length > 0 && selectedIds.value.length === results.value.length
})

const isIndeterminate = computed(() => {
  return selectedIds.value.length > 0 && selectedIds.value.length < results.value.length
})

// 处理全选/取消全选
const handleCheckAllChange = (val) => {
  results.value.forEach(result => {
    result.isSelected = val
  })
  selectedIds.value = val ? results.value.map(item => item.resId) : []
}

// 处理单个选择变更
const handleSelectChange = (checked, resId) => {
  if (checked) {
    selectedIds.value.push(resId)
  } else {
    const index = selectedIds.value.indexOf(resId)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    }
  }
}

const formatNumber = (num) => {
  return num ? num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) : '0.00'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const fetchResults = async () => {
  try {
    const response = await listAssessmentResults({ projectId: query.value })
    results.value = response.data.map(item => ({
      ...item,
      isSelected: false,
      createdAt: new Date() // 设置为当前时间
    }))
    
    // 获取所有项目和标准名称
    for (const result of results.value) {
      const nameRes = await getProjectName(result.projectId)
      projectNames.value[result.projectId] = nameRes.msg
      await loadStandardName(result.stdId)
    }
  } catch (error) {
    ElMessage.error('获取评估结果列表失败')
  }
}

// 批量删除确认
const confirmBatchDelete = () => {
  if (selectedIds.value.length === 0) return
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个评估结果吗？此操作不可恢复`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        // 这里假设后端提供了批量删除的API，如果没有，则需要循环调用单个删除
        const deletePromises = selectedIds.value.map(id => delAssessmentResult(id))
        await Promise.all(deletePromises)
        
        ElMessage.success('批量删除成功')
        fetchResults()
      } catch (error) {
        ElMessage.error('批量删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

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

const viewDetail = (resId) => {
  const result = results.value.find(r => r.resId === resId)
  if (!result) {
    ElMessage.error('未找到相关评估结果')
    return
  }
  
  router.push({
    path: `/standards/result-detail/${resId}`,
    query: {
      projectId: result.projectId,
      standardId: result.stdId
    }
  })
}

onMounted(() => {
  fetchResults()
})
</script>

<style scoped>

.title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.standard-name {
  font-size: 14px;
  color: var(--el-color-primary);
  font-weight: 500;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 16px 16px 48px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}



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

.batch-toolbar {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-count {
  color: #606266;
  font-size: 14px;
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
  position: relative;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.1);
}

.result-card.is-selected {
  border: 2px solid var(--el-color-primary);
}

.card-selection {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
}

.card-header {
  padding: 16px 16px 16px 48px;
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