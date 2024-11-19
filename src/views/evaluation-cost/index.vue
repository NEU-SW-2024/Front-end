<template>
  <div class="evaluation-cost">
    <el-card class="evaluation-card">
      <!-- 步骤条 -->
      <el-steps class="steps-bar" :active="activeStep" finish-status="success">
        <el-step title="选择标准" />
        <el-step title="填写项目信息" />
        <el-step title="评估结果" />
      </el-steps>
      <!-- 步骤内容 -->
      <div v-if="activeStep === 0" class="step-content">
        <el-descriptions title="选定标准" border column="2" class="description-list">
          <el-descriptions-item label="标准名称">示例标准名称</el-descriptions-item>
          <el-descriptions-item label="标准类型">团队标准</el-descriptions-item>
          <el-descriptions-item label="PDR值">2.5</el-descriptions-item>
          <el-descriptions-item label="风险因子">1.2</el-descriptions-item>
          <el-descriptions-item label="质量因子">1.5</el-descriptions-item>
        </el-descriptions>
        <div class="button-container">
          <el-button type="primary" @click="nextStep">确认并进入下一步</el-button>
        </div>
      </div>
      <div v-if="activeStep === 1" class="step-content">
        <el-form :model="projectInfo" label-width="120px" class="project-form">
          <el-form-item label="项目名称">
            <el-input v-model="projectInfo.name" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="功能点数量">
            <el-input-number v-model="projectInfo.functionPoints" :min="0" />
          </el-form-item>
          <el-form-item label="风险系数">
            <el-input-number v-model="projectInfo.riskFactor" :step="0.1" :min="0" />
          </el-form-item>
          <el-form-item label="质量因子">
            <el-input-number v-model="projectInfo.qualityFactor" :step="0.1" :min="0" />
          </el-form-item>
        </el-form>
        <div class="button-container">
          <el-button type="primary" @click="nextStep">确认并进入下一步</el-button>
        </div>
      </div>
      <div v-if="activeStep === 2" class="step-content">
        <div class="result-container">
          <h3 class="result-title">评估结果</h3>
          <div class="result-content">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="项目名称">
                {{ projectInfo.name || '未填写' }}
              </el-descriptions-item>
              <el-descriptions-item label="功能点数量">
                {{ projectInfo.functionPoints || 0 }}
              </el-descriptions-item>
              <el-descriptions-item label="预计总造价">
                <strong class="cost-value">{{ calculateCost() }}</strong> 元
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <!-- AI 分析部分 -->
        <div class="ai-analysis-section">
          <div class="button-container" v-if="!isAnalyzing && !aiAdvice">
            <el-button 
              type="primary" 
              @click="generateAIAdvice"
              :loading="isAnalyzing"
              class="analysis-button"
            >
              <el-icon class="button-icon"><Connection /></el-icon>
              生成AI建议
            </el-button>
          </div>

          <!-- AI 分析结果展示 -->
          <div v-if="aiAdvice" class="ai-advice-container">
            <div class="advice-header">
              <el-icon class="ai-icon"><Monitor /></el-icon>
              <h4>AI 分析建议</h4>
            </div>
            <div class="advice-content">
              <template v-for="(section, index) in parsedAIAdvice" :key="index">
                <div class="advice-section">
                  <h5>{{ section.title }}</h5>
                  <p>{{ section.content }}</p>
                </div>
              </template>
            </div>
          </div>

          <el-alert
            v-if="analysisError"
            title="生成建议失败"
            type="error"
            description="请稍后重试"
            show-icon
            closable
            class="analysis-error"
          />
        </div>

        <div class="button-container">
          <el-button @click="resetSteps">重新开始</el-button>
          <el-button type="primary" @click="exportReport" :disabled="!aiAdvice">
            <el-icon class="button-icon"><Download /></el-icon>
            导出报告
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Connection, Monitor, Download } from '@element-plus/icons-vue';
import OpenAI from 'openai';


// 从环境变量中获取 API key
const MOONSHOT_API_KEY = import.meta.env.VITE_APP_MOONSHOT_API_KEY;


// 项目信息
const projectInfo = ref({
  name: '',
  functionPoints: 0,
  riskFactor: 1.2,
  qualityFactor: 1.5,
});

// 当前步骤
const activeStep = ref(0);

// AI 分析相关状态
const isAnalyzing = ref(false);
const aiAdvice = ref('');
const analysisError = ref(false);

// 解析 AI 建议为结构化数据
const parsedAIAdvice = computed(() => {
  if (!aiAdvice.value) return [];
  // 这里假设 AI 返回的是特定格式的字符串，需要根据实际返回格式调整解析逻辑
  const sections = aiAdvice.value.split('\n\n');
  return sections.map(section => {
    const [title, ...content] = section.split('\n');
    return {
      title: title.replace(':', ''),
      content: content.join('\n')
    };
  });
});

// AI 客户端初始化
const client = new OpenAI({
  apiKey: MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.cn/v1",
  dangerouslyAllowBrowser: true
});

// 生成 AI 建议
const generateAIAdvice = async () => {
  isAnalyzing.value = true;
  analysisError.value = false;
  
  try {
    const prompt = `请针对以下软件项目提供专业的分析建议：
    项目名称：${projectInfo.value.name}
    功能点数量：${projectInfo.value.functionPoints}
    预计总造价：${calculateCost()} 元
    
    请从以下几个方面提供建议：
    1. 成本分配建议
    2. 资源分配建议
    3. 时间规划建议
    4. 项目风险提示
    5. 未来发展建议
    
    请以结构化的方式提供建议，每个方面单独成段。`;

    const completion = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: "你是一个专业的软件项目分析顾问，请针对项目信息提供专业、实用的建议。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    });

    aiAdvice.value = completion.choices[0].message.content;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    analysisError.value = true;
  } finally {
    isAnalyzing.value = false;
  }
};

// 导出报告
const exportReport = () => {
  // 这里可以实现导出功能，可以是 PDF 或其他格式
  console.log('Exporting report...');
};

// 计算造价
const calculateCost = () => {
  const baseCost = 1000; // 每功能点基础造价
  return (
    projectInfo.value.functionPoints *
    baseCost *
    projectInfo.value.riskFactor *
    projectInfo.value.qualityFactor
  ).toFixed(2);
};

// 下一步
const nextStep = () => {
  if (activeStep.value < 2) {
    activeStep.value++;
  }
};

// 重新开始
const resetSteps = () => {
  activeStep.value = 0;
  projectInfo.value = {
    name: '',
    functionPoints: 0,
    riskFactor: 1.2,
    qualityFactor: 1.5,
  };
  aiAdvice.value = '';
  analysisError.value = false;
};
</script>

<style scoped>
.evaluation-cost {
  padding: 40px;
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.evaluation-card {
  width: 780px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.steps-bar {
  margin: 20px 0 40px;
  padding: 0 40px;
}

.step-content {
  padding: 0 40px 40px;
}

.description-list {
  margin-bottom: 30px;
}

.description-list :deep(.el-descriptions__title) {
  font-size: 18px;
  margin-bottom: 20px;
}

.project-form {
  max-width: 500px;
  margin: 0 auto;
}

.project-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.result-container {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.result-title {
  font-size: 20px;
  color: #303133;
  margin: 0 0 20px;
}

.cost-value {
  color: #409eff;
  font-size: 24px;
}

.ai-analysis-section {
  margin-top: 30px;
}

.analysis-button {
  font-size: 16px;
  padding: 12px 24px;
}

.button-icon {
  margin-right: 8px;
}

.ai-advice-container {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  border: 1px solid #e4e7ed;
}

.advice-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.advice-header h4 {
  margin: 0 0 0 10px;
  font-size: 18px;
  color: #303133;
}

.ai-icon {
  font-size: 24px;
  color: #409eff;
}

.advice-content {
  color: #606266;
}

.advice-section {
  margin-bottom: 20px;
}

.advice-section h5 {
  color: #303133;
  margin: 0 0 8px;
  font-size: 16px;
}

.advice-section p {
  margin: 0;
  line-height: 1.6;
}

.analysis-error {
  margin: 20px 0;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}

/* 响应式调整 */
@media (max-width: 800px) {
  .evaluation-card {
    width: 100%;
    margin: 0 10px;
  }

  .steps-bar,
  .step-content {
    padding: 0 20px 20px;
  }

  .project-form {
    max-width: 100%;
  }

  .button-container {
    flex-direction: column;
    align-items: center;
  }

  .button-container .el-button {
    width: 100%;
    margin: 5px 0;
  }
}
</style>