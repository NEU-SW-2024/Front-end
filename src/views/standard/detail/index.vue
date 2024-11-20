<template>
  <div class="standard-detail">
    

    <!-- 详情卡片 -->
    <el-card class="detail-card">
      <template #header>
              <div class="card-header">
                <span class="title">标准详情</span>
                <div class="header-actions">
                  <el-tag size="medium" :type="standardData.stdStatus === 1 ? 'success' : 'info'" class="status-tag">
                    {{ standardData.stdStatus === 1 ? '启用' : '禁用' }}
                  </el-tag>
                  <el-button type="primary" @click="handleEdit" :icon="Edit">编辑</el-button>
                </div>
              </div>
            </template>

      <div class="detail-content">
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="detail-item">
              <span class="label">标准名称</span>
              <span class="value">{{ standardData.stdName }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <span class="label">标准类型</span>
              <span class="value">{{ standardData.stdType }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <span class="label">PDR值</span>
              <span class="value">{{ standardData.pdrValue }}</span>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <div class="detail-item">
              <span class="label">风险因子</span>
              <span class="value">{{ standardData.rskFactor }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <span class="label">质量因子</span>
              <span class="value">{{ standardData.qualityFactor }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <span class="label">软件因子</span>
              <span class="value">{{ standardData.swf }}</span>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <div class="detail-item">
              <span class="label">研发因子</span>
              <span class="value">{{ standardData.rdf }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <span class="label">转换因子</span>
              <span class="value">{{ standardData.conversionFactor }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <span class="label">日常数量</span>
              <span class="value">{{ standardData.dnc }}</span>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <el-row :gutter="24">
          <el-col :span="12">
            <div class="detail-item">
              <span class="label">创建者</span>
              <span class="value">{{ standardData.createdBy }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="label">创建时间</span>
              <span class="value">{{ standardData.createdAt }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="goBack">返回</el-button>
    </div>
	
	<!-- 新增修改对话框 -->
	    <el-dialog
	      v-model="dialogVisible"
	      title="修改评估标准"
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
	              />
	            </el-form-item>
	          </el-col>
	        </el-row>
	
	        <el-row :gutter="20">
	          <el-col :span="8">
	            <el-form-item label="软件因子" prop="swf">
	              <el-input-number
	                v-model="form.swf"
	                :precision="2"
	                :step="0.1"
	                :min="1"
	                controls-position="right"
	                class="w-full"
	              />
	            </el-form-item>
	          </el-col>
	          <el-col :span="8">
	            <el-form-item label="研发因子" prop="rdf">
	              <el-input-number
	                v-model="form.rdf"
	                :precision="2"
	                :step="0.1"
	                :min="1"
	                controls-position="right"
	                class="w-full"
	              />
	            </el-form-item>
	          </el-col>
	          <el-col :span="8">
	            <el-form-item label="转换因子" prop="conversionFactor">
	              <el-input-number
	                v-model="form.conversionFactor"
	                :precision="2"
	                :step="0.1"
	                :min="0"
	                controls-position="right"
	                class="w-full"
	              />
	            </el-form-item>
	          </el-col>
	        </el-row>
	
	        <el-row :gutter="20">
	          <el-col :span="12">
	            <el-form-item label="日常数量" prop="dnc">
	              <el-input-number
	                v-model="form.dnc"
	                :precision="2"
	                :step="1000"
	                :min="0"
	                controls-position="right"
	                class="w-full"
	              />
	            </el-form-item>
	          </el-col>
	          <el-col :span="12">
	            <el-form-item label="标准状态" prop="stdStatus">
	              <el-switch
	                v-model="form.stdStatus"
	                :active-value="1"
	                :inactive-value="0"
	                active-text="启用"
	                inactive-text="停用"
	              />
	            </el-form-item>
	          </el-col>
	        </el-row>
	      </el-form>
	
	      <template #footer>
	        <div class="dialog-footer">
	          <el-button @click="dialogVisible = false">取消</el-button>
	          <el-button type="primary" @click="submitForm" :loading="loading">确定</el-button>
	        </div>
	      </template>
	    </el-dialog>
	
	
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStandardById, updateStandard } from '@/api/system/assessmentStandard';
import { Edit } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

const dialogVisible = ref(false);
const loading = ref(false);
const formRef = ref();

// 标准数据
const standardData = ref({
  stdName: '',
  stdType: '',
  stdStatus: 0,
  pdrValue: 0,
  rskFactor: 0,
  qualityFactor: 0,
  swf: 0,
  rdf: 0,
  conversionFactor: 0,
  dnc: 0,
  createdBy: '',
  createdAt: '',
});

// 表单数据
const form = reactive({
  stdId: '',
  stdName: '',
  stdType: '',
  stdStatus: 0,
  pdrValue: 0,
  rskFactor: 1,
  qualityFactor: 1,
  swf: 1,
  rdf: 1,
  conversionFactor: 0,
  dnc: 0
});

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



// 页面加载时获取标准详情
onMounted(() => {
  const stdId = route.params.id as string;
  if (stdId) {
    getStandardById(stdId).then(response => {
      standardData.value = response.data;
    });
  }
});


// 打开编辑对话框
const handleEdit = () => {
  Object.assign(form, standardData.value);
  dialogVisible.value = true;
};


// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    await updateStandard(form);
    ElMessage.success('修改标准成功');
    dialogVisible.value = false;
    // 刷新详情数据
    const stdId = route.params.id as string;
    if (stdId) {
      const response = await getStandardById(stdId);
      standardData.value = response.data;
    }
  } catch (error) {
    ElMessage.error(error.message || '修改标准失败');
  } finally {
    loading.value = false;
  }
};

// 返回列表方法
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.standard-detail {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}



.detail-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px 0 rgba(0,0,0,0.05);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #2c3e50;
}

.detail-content {
  padding: 24px 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.value {
  color: #2c3e50;
  font-size: 16px;
  font-weight: 500;
}

.action-buttons {
  margin-top: 24px;
  text-align: center;
}

.action-buttons .el-button {
  width: 120px;
  height: 40px;
  font-weight: 500;
  transition: all 0.3s;
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-divider) {
  margin: 32px 0;
}

:deep(.el-tag) {
  font-weight: 500;
}

:deep(.el-row) {
  margin-bottom: 0 !important;
}

:deep(.el-col) {
  padding-bottom: 0 !important;
}


.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-tag {
  margin-right: 8px;
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}

:deep(.el-input-number.w-full) {
  width: 100%;
}
</style>