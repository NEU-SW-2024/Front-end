<template>
  <div class="test20241117">
    <!-- 页面头部 -->
    <header class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12" class="search-container">
          <el-input
            v-model="query"
            placeholder="输入标准名称搜索..."
            clearable
            :prefix-icon="Search"
            @keyup.enter="fetchStandards"
          >
            <template #append>
              <el-button type="primary" @click="fetchStandards">
                搜索
              </el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </header>

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
            shadow="hover"
          >
            <div class="card-header">
              <el-checkbox 
                :model-value="selectedStandard === standard.stdId" 
                @change="handleCheckboxChange(standard.stdId)"
              />
              <h3 class="card-title">{{ standard.stdName }}</h3>
              <el-tag size="small" :type="standard.stdStatus ? 'success' : 'info'">
                {{ standard.stdStatus ? '启用' : '停用' }}
              </el-tag>
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

    <!-- 底部操作按钮 -->
    <div class="action-section">
      <el-button 
        type="primary" 
        size="large" 
        class="evaluate-button" 
        :disabled="!selectedStandard"
        @click="calculateCost"
      >
        计算综合造价
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { listStandards } from '@/api/system/assessmentStandard';

const router = useRouter();
const route = useRoute();
const query = ref('');
const standards = ref([]);
const selectedStandard = ref(null);
const projectId = ref(null);

// 获取标准列表
const fetchStandards = async () => {
  try {
    const response = await listStandards({ stdName: query.value });
    standards.value = response.data;
  } catch (error) {
    ElMessage.error('获取标准列表失败');
  }
};

// 处理单选框选择变化
const handleCheckboxChange = (selectedId) => {
  if (selectedStandard.value === selectedId) {
    selectedStandard.value = null;
  } else {
    selectedStandard.value = selectedId;
  }
};

const viewDetail = (stdId) => {
  router.push(`/standards/detail/${stdId}`);
};

// 计算综合造价按钮点击事件
const calculateCost = () => {
  if (selectedStandard.value && projectId.value) {
    router.push({
      path: '/standards/final-result',
      query: {
        projectId: projectId.value,
        standardId: selectedStandard.value
      }
    });
  } else {
    ElMessage.warning('请选择评估标准');
  }
};

// 页面加载时获取数据和项目ID
onMounted(() => {
  // 从路由中获取项目ID
  projectId.value = route.query.projectId;
  if (!projectId.value) {
    ElMessage.error('未获取到项目信息');
    router.push('/standards/calculation');
    return;
  }
  fetchStandards();
});
</script>

<style scoped>
.test20241117 {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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

.standard-card {
  height: 100%;
  border: none;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.standard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
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

.action-section {
  margin-top: 24px;
  text-align: center;
}

.evaluate-button {
  width: 300px;
  height: 48px;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, #42a5f5, #1e88e5);
  color: white;
  border-radius: 8px;
  transition: all 0.3s;
}

.evaluate-button:disabled {
  background: #d3dce6;
  cursor: not-allowed;
}

.evaluate-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.detail-button {
  width: 100%;
  font-weight: 500;
  color: white;
  background-color: #409eff;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.detail-button:hover {
  background-color: #66b1ff;
  transform: scale(1.02);
}
</style>