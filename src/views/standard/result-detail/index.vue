<template>
  <div class="evaluation-page">
    <!-- 顶部卡片区域 -->
    <div class="card-container">
      <el-row type="flex" justify="center" :gutter="20">
        <el-col :span="4.5" v-for="card in cards" :key="card.title">
          <el-card shadow="hover" class="metric-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">{{ card.title }}</span>
              </div>
            </template>
            <div class="card-content">
              <p class="card-value">{{ card.value }}</p>
              <p class="card-unit">{{ card.unit }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 中间公式区域 -->
    <div class="equation-section">
      <el-card class="equation-card" shadow="hover">
        <div class="equation-container">
          <h3 class="equation-title">软件开发费用计算公式说明</h3>
          
          <div class="equation-description">
            <p>本评估系统基于以下公式计算软件开发费用（SDC）：</p>
          </div>
          
          <img src="./images/equation.svg" alt="公式" class="equation-image" />
          
          <div class="equation-explanation">
            <div class="explanation-grid">
              <div class="explanation-item">
                <span class="term">SDC：</span>
                <span class="definition">软件开发费用</span>
              </div>
              <div class="explanation-item">
                <span class="term">PDR：</span>
                <span class="definition">每功能点成本系数</span>
              </div>
              <div class="explanation-item">
                <span class="term">SWF：</span>
                <span class="definition">软件因素调整因子</span>
              </div>
              <div class="explanation-item">
                <span class="term">RDF：</span>
                <span class="definition">开发因素调整因子</span>
              </div>
            </div>
            
            <p class="additional-info">注：ESDC为根据质量等级和风险因子调整后的最终软件开发费用</p>
          </div>
        </div>
      </el-card>
    </div>

    <div class="details-section">
      <el-card shadow="hover">
        <template #header>
          <div class="details-header">
            <span class="details-title">特征取值明细</span>
          </div>
        </template>
        <!-- SDC 和 ESDC 显示 -->
        <el-descriptions border :column="2" class="details-content highlight-row">
          <el-descriptions-item label="SDC" class="highlight-item">
            <span class="highlight-value">{{ formatCurrency(calculationResult.projectSDC) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="ESDC" class="highlight-item">
            <span class="highlight-value">{{ formatCurrency(calculationResult.projectESDC) }}</span>
          </el-descriptions-item>
        </el-descriptions>
        <!-- 其他详情信息 -->
        <el-descriptions border :column="3" class="details-content">
          <el-descriptions-item 
            v-for="item in filteredDetails" 
            :key="item.label"
            :label="item.label"
          >
            {{ item.value }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <!-- 底部操作按钮 -->
    <div class="actions">
      <el-button type="primary" class="action-button" @click="goBack">返回</el-button>
      <el-button 
        type="success" 
        class="action-button" 
        @click="saveResult"
        :loading="saving"
      >
        保存结果
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { calculateResult, addAssessmentResult, getProjectDFP } from '@/api/system/assessmentResult';

const router = useRouter();
const route = useRoute();
const saving = ref(false);
const calculationResult = ref({
  projectSDC: 0,
  projectESDC: 0,
  createdAt: null,
  updatedAt: null
});
const projectDFP = ref(null);
// 格式化金额
const formatCurrency = (value) => {
  return value ? value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) : '0.00';
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
};

// 顶部卡片数据
const cards = computed(() => [
  { title: "功能点", value: projectDFP.value || '-', unit: "FP" },
  { title: "SDC", value: formatCurrency(calculationResult.value.projectSDC), unit: "元" },
  { title: "ESDC", value: formatCurrency(calculationResult.value.projectESDC), unit: "元" },
  { title: "创建时间", value: formatDate(calculationResult.value.createdAt), unit: "" },
  { title: "更新时间", value: formatDate(calculationResult.value.updatedAt), unit: "" }
]);

// 加载计算结果
const loadCalculationResult = async () => {
  try {
    const { projectId, standardId } = route.query;
    if (!projectId || !standardId) {
      ElMessage.error('参数不完整');
      router.push('/standards/choose-standard');
      return;
    }

    const response = await calculateResult({
      projectId,
      stdId: standardId
    });
    calculationResult.value = response.data;
	console.log(calculationResult.value);
  } catch (error) {
    ElMessage.error('计算结果获取失败');
  }
};

// 保存结果
const saveResult = async () => {
  try {
    saving.value = true;
    const { projectId, standardId } = route.query;
    
    await addAssessmentResult({
      projectId: parseInt(projectId),
      stdId: parseInt(standardId),
      projectSDC: calculationResult.value.projectSDC,
      projectESDC: calculationResult.value.projectESDC
    });

    ElMessage.success('保存成功');
    router.push('/standards/calculation'); // 保存成功后返回列表页
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};
const loadProjectDFP = async () => {
  try {
	// console.log("1");
    const { projectId } = route.query;
	// console.log("2");
    const response = await getProjectDFP(projectId);
	// console.log("3");
    projectDFP.value = response.data;
	
  } catch (error) {
    ElMessage.error('功能点数据获取失败');
  }
};

// 页面加载时获取数据
onMounted(() => {
  loadProjectDFP();
  loadCalculationResult();
});

// 其他数据保持不变
const details = ref([
  { label: "类别", value: "软件规模度量" },
  { label: "特征", value: "管理容量的功能点数" },
  { label: "取值", value: "794" },
  { label: "PDR", value: "123" },
  { label: "软件因素调整因子SWF", value: "123" },
  { label: "开发因素调整因子RDF", value: "1" },
  { label: "人月折算系数", value: "174" },
  { label: "行业非人力成本", value: "20,000" },
  { label: "直接非人力成本DNC(元)", value: "0" },
  { label: "RSK", value: "1" },
  { label: "质量等级因子(Q)", value: "1" }
]);

const filteredDetails = computed(() => {
  return details.value;
});
</script>

<style scoped>
	
.evaluation-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.card-container {
  margin-bottom: 24px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.card-container .el-row {
  width: 95%;
  max-width: 1400px;
}

.metric-card {
  height: 100%;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 4px 12px 0 rgba(0,0,0,0.05);
  margin-bottom: 24px;
  min-width: 220px;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.1);
}

.card-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content {
  padding: 16px;
  text-align: center;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-value {
  font-size: 22px;
  font-weight: bold;
  color: #409EFF;
  margin: 4px 0;
  white-space: nowrap;
}

.card-unit {
  font-size: 13px;
  color: #606266;
  margin: 0;
}

.equation-section {
  margin: 32px 0;
}

.equation-card {
  border: none;
  box-shadow: 0 4px 12px 0 rgba(0,0,0,0.05);
}

.equation-container {
  padding: 32px;
  background: #ffffff;
  border-radius: 8px;
  text-align: center;
}

.equation-image {
  max-width: 90%;
  height: auto;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.details-section {
  margin-bottom: 24px;
}

.details-header {
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.details-title {
  font-size: 18px;
  font-weight: 500;
  color: #2c3e50;
}

.details-content {
  padding: 20px;
}

:deep(.highlight-item) {
  background-color: #ecf5ff;
}

:deep(.highlight-value) {
  color: #409EFF;
  font-weight: bold;
  font-size: 16px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.action-button {
  padding: 12px 24px;
  font-weight: 500;
}

:deep(.el-descriptions__cell) {
  padding: 16px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-descriptions__content) {
  color: #2c3e50;
}

@media (max-width: 1440px) {
  .metric-card {
    min-width: 200px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-value {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .evaluation-page {
    padding: 16px;
  }
  
  .card-container {
    margin-bottom: 16px;
  }
  
  .equation-container {
    padding: 16px;
  }
  
  .equation-image {
    max-width: 100%;
  }
}

.highlight-row {
  margin-bottom: 20px;
  background-color: #f0f9ff;  /* 浅蓝色背景 */
}

.highlight-row :deep(.el-descriptions__cell) {
  padding: 20px;
}

.highlight-row :deep(.el-descriptions__label) {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.highlight-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.equation-title {
  font-size: 18px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 16px;
  text-align: center;
}

.equation-description {
  color: #606266;
  margin-bottom: 20px;
  text-align: left;
}

.equation-explanation {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.explanation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.explanation-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.term {
  font-weight: 500;
  color: #409EFF;
  min-width: 50px;
}

.definition {
  color: #606266;
}

.additional-info {
  color: #909399;
  font-size: 14px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

/* 调整公式图片容器的样式 */
.equation-container {
  padding: 32px;
  background: #ffffff;
  border-radius: 8px;
}

.equation-image {
  margin: 20px 0;
  max-width: 90%;
  height: auto;
}
</style>