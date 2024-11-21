<template>
  <div class="test20241117">
    <!-- 页面头部 -->
    <header class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button 
            type="primary" 
            class="create-button" 
            @click="openDialog"
            :icon="Plus"
          >
            创建新标准
          </el-button>
        </el-col>
        
        <el-col :span="12">
          <div class="search-container">
            <el-input
              v-model="query"
              placeholder="输入标准名称搜索..."
              clearable
              :prefix-icon="Search"
            >
              <template #append>
                <el-button type="primary" @click="fetchStandards">
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>
        </el-col>
      </el-row>
    </header>

    <!-- 批量操作工具栏 -->
    <div class="batch-toolbar" v-show="standards.length">
      <div class="toolbar-left">
        <el-checkbox
          v-model="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>
        <!-- 添加取消选择按钮 -->
        <el-button 
          type="info" 
          link
          :disabled="!selectedIds.length"
          @click="cancelAllSelection"
        >
          取消选择
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button
          type="danger"
          :disabled="!selectedIds.length"
          @click="confirmBatchDelete"
        >
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>
    </div>

    <!-- 标准卡片列表 -->
    <section class="card-section">
      <el-row :gutter="20">
        <el-col 
          :xs="24" 
          :sm="12" 
          :md="8" 
          v-for="standard in standards" 
          :key="standard.stdId"
        >
          <el-card 
            class="standard-card" 
            :body-style="{ padding: '0px' }"
            :class="{ 'is-selected': selectedIds.includes(standard.stdId) }"
          >
            
            <div class="card-header">
              <div class="header-left">
                <el-checkbox
                  v-model="standard.isSelected"
                  @change="(val) => handleSelectChange(val, standard.stdId)"
                  class="select-checkbox"
                />
                <h3 class="card-title">{{ standard.stdName }}</h3>
              </div>
              <div class="card-actions">
                <el-tag size="small" :type="standard.stdStatus ? 'success' : 'info'">
                  {{ standard.stdStatus ? '启用' : '停用' }}
                </el-tag>
                <el-button
                  type="danger"
                  circle
                  size="small"
                  class="delete-button"
                  :icon="Delete"
                  @click.stop="confirmDelete(standard.stdId)"
                />
              </div>
            </div>
            
            <div class="card-content">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">标准类型</span>
                  <span class="value">{{ standard.stdType }}</span>
                </div>
                <div class="info-item">
                  <span class="label">PDR值</span>
                  <span class="value">{{ standard.pdrValue }}</span>
                </div>
                <div class="info-item">
                  <span class="label">风险因子</span>
                  <span class="value">{{ standard.rskFactor }}</span>
                </div>
                <div class="info-item">
                  <span class="label">质量因子</span>
                  <span class="value">{{ standard.qualityFactor }}</span>
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <el-button 
                type="primary" 
                class="detail-button"
                @click="viewDetail(standard.stdId)"
              >
                查看详情
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 新增标准对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新增评估标准"
      width="60%"
      :destroy-on-close="true"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="standard-form"
        :scroll-to-error="true"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标准名称" prop="stdName">
              <el-input 
                v-model="form.stdName"
                placeholder="请输入标准名称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="标准类型" prop="stdType">
              <el-input 
                v-model="form.stdType"
                placeholder="请输入标准类型"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="PDR值" prop="pdrValue">
              <el-input-number
                v-model="form.pdrValue"
                :precision="2"
                :step="0.1"
                :min="0"
                controls-position="right"
                class="w-full"
                placeholder="请输入PDR值"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="风险因子" prop="rskFactor">
              <el-input-number
                v-model="form.rskFactor"
                :precision="2"
                :step="0.1"
                :min="1"
                controls-position="right"
                class="w-full"
                placeholder="请输入风险因子"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="质量因子" prop="qualityFactor">
              <el-input-number
                v-model="form.qualityFactor"
                :precision="2"
                :step="0.1"
                :min="1"
                controls-position="right"
                class="w-full"
                placeholder="请输入质量因子"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="软件复杂度因子" prop="swf">
              <el-input-number
                v-model="form.swf"
                :precision="2"
                :step="0.1"
                :min="1"
                controls-position="right"
                class="w-full"
                placeholder="请输入软件复杂度因子"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="开发复杂度因子" prop="rdf">
              <el-input-number
                v-model="form.rdf"
                :precision="2"
                :step="0.1"
                :min="1"
                controls-position="right"
                class="w-full"
                placeholder="请输入开发复杂度因子"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="人月折算系数" prop="conversionFactor">
              <el-input-number
                v-model="form.conversionFactor"
                :precision="2"
                :step="0.1"
                :min="0"
                controls-position="right"
                class="w-full"
                placeholder="请输入人月折算系数"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="非人力成本" prop="dnc">
              <el-input-number
                v-model="form.dnc"
                :precision="2"
                :step="1000"
                :min="0"
                controls-position="right"
                class="w-full"
                placeholder="请输入非人力成本"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="标准状态" prop="stdStatus">
              <el-switch
                v-model="form.stdStatus"
                :active-value="true"
                :inactive-value="false"
                active-text="启用"
                inactive-text="停用"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

<!-- 在表单的 </el-form> 标签后，dialog-footer 前添加 -->
<div class="document-links">
  <div class="document-section-title">相关参考文档：</div>
  <div class="document-buttons">
    <el-button 
      type="info" 
      link
      @click="openDocument('/attachments/document1.pdf')"
    >
      <el-icon><Document /></el-icon>
      参考文档1：2024年中国软件行业基准数据
    </el-button>
    <el-button 
      type="info" 
      link
      @click="openDocument('/attachments/document2.pdf')"
    >
      <el-icon><Document /></el-icon>
      参考文档2：软件质量的一些度量因子
    </el-button>
  </div>
</div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="loading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Delete, Document } from '@element-plus/icons-vue'
import { listStandards, delStandard, addStandard } from '@/api/system/assessmentStandard'

const router = useRouter()
const formRef = ref(null)
const dialogVisible = ref(false)
const loading = ref(false)
const query = ref('')
const standards = ref([])
const selectedIds = ref([])

// 在 script setup 中添加
// 全选状态
const isAllSelected = computed(() => {
  return standards.value.length > 0 && selectedIds.value.length === standards.value.length
})

// 半选状态(部分选中)
const isIndeterminate = computed(() => {
  return selectedIds.value.length > 0 && selectedIds.value.length < standards.value.length
})

const cancelAllSelection = () => {
  standards.value.forEach(standard => {
    standard.isSelected = false
  })
  selectedIds.value = []
}


// 处理全选/取消全选
const handleCheckAllChange = (val) => {
  standards.value.forEach(standard => {
    standard.isSelected = val
  })
  selectedIds.value = val ? standards.value.map(item => item.stdId) : []
}




// 修改选择回调
const handleSelectChange = (checked, stdId) => {
  if (checked) {
    selectedIds.value.push(stdId)
  } else {
    const index = selectedIds.value.indexOf(stdId)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    }
  }
}

const confirmBatchDelete = () => {
  if (selectedIds.value.length === 0) return
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个标准吗？此操作不可恢复`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const deletePromises = selectedIds.value.map(id => delStandard(id))
        await Promise.all(deletePromises)
        ElMessage.success('批量删除成功')
        fetchStandards()
      } catch (error) {
        ElMessage.error('批量删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 表单数据
const form = reactive({
  stdName: '',
  stdType: '',
  stdStatus: true,
  pdrValue: 0,
  rskFactor: 1,
  qualityFactor: 1,
  swf: 1,
  rdf: 1,
  conversionFactor: 0,
  dnc: 0
})

// 表单验证规则（与后端验证对应）
const rules = {
  stdName: [
    { required: true, message: '标准名称不能为空', trigger: 'blur' },
    { max: 100, message: '标准名称长度不能超过100个字符', trigger: 'blur' }
  ],
  stdType: [
    { required: true, message: '标准类型不能为空', trigger: 'blur' },
    { max: 50, message: '标准类型长度不能超过50个字符', trigger: 'blur' }
  ],
  pdrValue: [
    { required: true, message: 'PDR取值不能为空', trigger: 'blur' },
    { type: 'number', min: 0, message: 'PDR取值必须大于0', trigger: 'blur' }
  ],
  rskFactor: [
    { required: true, message: '风险因子不能为空', trigger: 'blur' },
    { type: 'number', min: 1, message: '风险因子必须大于等于1', trigger: 'blur' }
  ],
  qualityFactor: [
    { required: true, message: '质量因子不能为空', trigger: 'blur' },
    { type: 'number', min: 1, message: '质量因子必须大于等于1', trigger: 'blur' }
  ],
  swf: [
    { required: true, message: '软件复杂度因子不能为空', trigger: 'blur' },
    { type: 'number', min: 1, message: '软件复杂度因子必须大于等于1', trigger: 'blur' }
  ],
  rdf: [
    { required: true, message: '开发复杂度因子不能为空', trigger: 'blur' },
    { type: 'number', min: 1, message: '开发复杂度因子必须大于等于1', trigger: 'blur' }
  ],
  conversionFactor: [
    { required: true, message: '人月折算系数不能为空', trigger: 'blur' },
    { type: 'number', min: 0, message: '人月折算系数必须大于0', trigger: 'blur' }
  ],
  dnc: [
    { required: true, message: '非人力成本不能为空', trigger: 'blur' },
    { type: 'number', min: 0, message: '非人力成本必须大于等于0', trigger: 'blur' }
  ]
}

// 获取标准列表
// Modified fetchStandards
const fetchStandards = async () => {
  try {
    const response = await listStandards({ stdName: query.value })
    standards.value = response.data.map(item => ({
      ...item,
      isSelected: false
    }))
    selectedIds.value = [] // Reset selection
  } catch (error) {
    ElMessage.error('获取标准列表失败')
  }
}

// 打开对话框
const openDialog = () => {
  dialogVisible.value = true
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  Object.assign(form, {
    stdName: '',
    stdType: '',
    stdStatus: true,
    pdrValue: 0,
    rskFactor: 1,
    qualityFactor: 1,
    swf: 1,
    rdf: 1,
    conversionFactor: 0,
    dnc: 0
  })
}


// 在 setup 函数中添加 openDocument 方法
const openDocument = (path) => {
  // 使用 window.open 打开文档
  window.open(path, '_blank')
  
  // 或者如果你想使用 download 属性下载文件：
  // const link = document.createElement('a')
  // link.href = path
  // link.download = path.split('/').pop() // 获取文件名
  // document.body.appendChild(link)
  // link.click()
  // document.body.removeChild(link)
}


// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await addStandard(form)
    ElMessage.success('新增标准成功')
    closeDialog()
    fetchStandards()
  } catch (error) {
    ElMessage.error(error.message || '新增标准失败')
  } finally {
    loading.value = false
  }
}

// 删除标准
const confirmDelete = (stdId) => {
  ElMessageBox.confirm(
    '确定要删除该标准吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await delStandard(stdId)
        ElMessage.success('删除成功')
        fetchStandards()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 查看详情
const viewDetail = (stdId) => {
  router.push(`/standards/detail/${stdId}`)
}

// 页面加载时获取数据
onMounted(() => {
  fetchStandards()
})
</script>

<style scoped>
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

.card-selection {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
}

.card-header {
  padding: 16px 16px 16px 48px;
}

.standard-card.is-selected {
  border: 2px solid var(--el-color-primary);
}




.document-links {
  padding: 0 20px 20px;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}

.document-section-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  padding-top: 20px;
}

.document-buttons {
  display: flex;
  gap: 16px;
}

.document-buttons .el-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
	
	
.test20241117 {
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

.create-button {
  width: auto;
  height: 40px;
  font-weight: 500;
  transition: all 0.3s;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.card-section {
  margin-top: 24px;
}

/* 给每个 el-row 增加下间距 */
.card-section .el-row {
  margin-bottom: 24px;
}

/* 最后一个 row 不需要 margin-bottom */
.card-section .el-row:last-child {
  margin-bottom: 0;
}

.standard-card {
  height: 100%;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 4px 12px 0 rgba(0,0,0,0.05);
  margin-bottom: 24px; /* 增加这一行 */
}

.standard-card:hover {
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

.standard-form {
  padding: 20px;
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}

:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

:deep(.el-input-number.w-full) {
  width: 100%;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
}


.card-header {
  padding: 16px;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-checkbox {
  margin-right: 8px;
}

/* 移除以下样式 */
.card-selection {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
}


.batch-toolbar {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 在已有样式中添加 */
.batch-toolbar .el-checkbox {
  margin-right: 8px;
}

.batch-toolbar .el-button {
  margin-left: auto; /* 将删除按钮推到右边 */
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-right {
  margin-left: auto;
}

.batch-toolbar .el-checkbox {
  margin-right: 8px;
}
</style>