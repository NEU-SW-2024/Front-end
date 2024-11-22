<template>
  <div class="page-container">
    <div class="steps-container">
      <el-steps 
        :active="activeStep - 1" 
        align-center 
        finish-status="success" 
        class="custom-steps"
      >
        <el-step 
          v-for="(step, index) in steps" 
          :key="index" 
          :title="step.title" 
          :description="step.description"
        ></el-step>
      </el-steps>

      <!-- 动态内容显示区域 -->
      <div class="step-content">
        <!-- 步骤 1: 功能点录入 -->
        <Step1 v-if="activeStep === 1" :featurePoints="featurePoints" :projectId="projectId" @addPoint="addFeaturePoint" @deletePoint="deleteFeaturePoint" @validate="handleValidation"/>
        <!-- 步骤 2: 功能点分类与复杂度选择 -->
        <Step2 v-if="activeStep === 2" :featurePoints="featurePoints" :projectId="projectId" @prevStep="goToPrevStep" />
        <!-- 步骤 3: 计算未调整功能点（UFP） -->
        <Step3 v-if="activeStep === 3" :featurePoints="featurePoints" :projectId="projectId" @prevStep="goToPrevStep" @nextStep="goToNextStep" />
        <!-- 步骤 4: 复杂度调整 -->
        <Step4 v-if="activeStep === 4" :adjustmentFactors="adjustmentFactors" :featurePoints="featurePoints" :projectId="projectId" @prevStep="goToPrevStep" @nextStep="goToNextStep" />
        <!-- 步骤 5: 功能点分析结果 -->
        <Step5 ref="Step5" v-if="activeStep === 5" :adjustmentFactors="adjustmentFactors" :featurePoints="featurePoints" :projectId="projectId" :projectProgress="projectProgress" @prevStep="goToPrevStep" />
      </div>

      <!-- 下一步和上一步按钮 -->
      <div class="step-footer">
        <el-button type="default" @click="goToPrevStep" :disabled="activeStep === 1">上一步</el-button>
        <el-button
            type="primary"
            @click="goToNextStep"
            :class="{ 'return-btn': activeStep === steps.length }"
        >
          {{ activeStep === steps.length ? '确认' : '下一步' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Refresh } from '@element-plus/icons-vue';
import Step1 from './Step1.vue';
import Step2 from './Step2.vue';
import Step3 from "./Step3.vue";
import Step4 from './Step4.vue';
import Step5 from "./Step5.vue";
import request from '@/utils/request';

export default {
  
  name: 'Index',
  components: {
    Step1,
    Step2,
    Step3,
    Step4,
    Step5
  },props: {
    projectId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      projectId:null,
      activeStep: 1, // 当前激活的步骤
      steps: [
        {title: '功能点识别录入'},
        {title: '功能点分类'},
        {title: '计算未调整功能点'},
        {title: '复杂度调整'},
        {title: '计算调整功能点'},
      ],
      featurePoints: [], // 功能点数据
      isStepValid: false, // 当前步骤的验证状态
      adjustmentFactors: [
  { projectId: this.projectId, measureName: '数据通信', di: 0},
  { projectId: this.projectId, measureName: '分布式数据处理', di: 0},
  { projectId: this.projectId, measureName: '性能', di: 0 },
  { projectId: this.projectId, measureName: '重度配置', di: 0 },
  { projectId: this.projectId, measureName: '处理速率', di: 0},
  { projectId: this.projectId, measureName: '在线数据输入', di: 0 },
  { projectId: this.projectId, measureName: '最终用户使用效率', di:0},
  { projectId: this.projectId, measureName: '在线升级', di: 0 },
  { projectId: this.projectId, measureName: '复杂处理', di: 0},
  { projectId: this.projectId, measureName: '可重用性', di: 0},
  { projectId: this.projectId, measureName: '易安装性', di: 0 },
  { projectId: this.projectId, measureName: '易操作性', di:0},
  { projectId: this.projectId, measureName: '多场所', di:0},
  { projectId: this.projectId, measureName: '支持变更', di: 0 }
], // 复杂度调整因子
      projectProgress: 0,
    };
  },
  created() {
  console.log('完整的路由信息:', this.$route);
  console.log('路由查询参数:', this.$route.query);

  const projectIdParam = this.$route.query.projectId;
  const converted = Number(projectIdParam);

  console.log('原始参数:', projectIdParam);
  console.log('转换结果:', converted);
  console.log('是否为 NaN:', isNaN(converted));

  this.projectId = !isNaN(converted) ? converted : null;
  console.log('Project ID:', this.projectId); // 用于调试，确保参数已正确接收
},
  methods: {
    // 下一步按钮点击
    goToNextStep() {
      if (this.activeStep === 1 && !this.validateStep1()) {
        this.$message.error('请确保所有功能点的名称已填写且唯一！');
        return;
      }
      if (this.activeStep === 2 && !this.validateStep2()) {
        this.$message.error('请确保所有功能点的分类和复杂度均已选择！');
        return;
      }
      if (this.activeStep === 4 && !this.validateStep4()) {
        this.$message.error('请确保所有复杂度调整因子已填写！');
        return;
      }
      
      if (this.activeStep === this.steps.length) {
        if (this.$refs.Step5) {
          // 清空数据
          this.featurePoints = [];
          this.adjustmentFactors = [];
          this.activeStep = 1;
          // 关闭原来页面
          // this.$router.go(-1);
           this.$refs.Step5.gotoAssessedPage();
           console.log("确认");
         } else {
           console.warn('Step5 组件未找到');
         }
      } else {
        // 否则继续下一步
        this.activeStep++;

      }
    },
    // 上一步按钮点击
    goToPrevStep() {
      if (this.activeStep > 1) {
        this.activeStep--;
      }
    },
    // 校验步骤一：检查功能点名称是否填写且唯一
    validateStep1() {
      const names = this.featurePoints.map((point) => point.funcName.trim());
      return (
          this.featurePoints.length > 0 &&
          names.every((funcName) => funcName !== '') &&
          names.length === new Set(names).size
      );
    },
    // 校验步骤二：检查每个功能点是否选择了分类和复杂度
    validateStep2() {
      return this.featurePoints.every(point => point.tag && point.diff);
    },
    // 校验步骤4
    validateStep4() {
  // 检查是否所有GSC因子都已评分
  console.log(this.adjustmentFactors)
  return this.adjustmentFactors.every(factor => 
    typeof factor.di === 'number' && factor.di >= 0 && factor.di <= 5
  );
},
    handleValidation(isValid) {
      this.isStepValid = isValid;
    },
  },
  mounted() {
  }
};
</script>

<style scoped>
.page-container {
  width: 1000px; /* 固定卡片宽度 */
  margin: 50px auto; /* 居中显示 */
  padding: 20px;
  background-color: #ffffff; /* 卡片背景颜色 */
  border-radius: 16px; /* 卡片圆角 */
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.1); /* 卡片阴影 */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative; /* 为了定位返回按钮 */
}


.steps-container {
  width: 100%; /* 容器宽度与卡片一致 */
}

.custom-steps {
  margin: 20px 0 40px;
  padding: 20px 0;
}

:deep(.el-steps) {
  --el-step-icon-size: 34px;
}

:deep(.el-step__head.is-success) {
  color: #67c23a;
  border-color: #67c23a;
}

:deep(.el-step__title) {
  font-size: 15px;
  font-weight: 500;
  margin-top: 8px;
}

:deep(.el-step__description) {
  font-size: 13px;
  margin-top: 4px;
}

:deep(.el-step.is-center) {
  flex-basis: 20%;
}

:deep(.el-step.is-active) {
  .el-step__title {
    color: var(--el-color-primary);
    font-weight: 600;
  }
  .el-step__icon {
    box-shadow: 0 0 12px rgba(64, 158, 255, 0.2);
  }
}

:deep(.el-step.is-success) {
  .el-step__title {
    color: #67c23a;
  }
  .el-step__head.is-success {
    color: #67c23a;
    border-color: #67c23a;
    background-color: #67c23a;
  }
}

:deep(.el-step__line) {
  background-color: #dcdfe6;
}

:deep(.el-step__line.is-success) {
  background-color: #67c23a;
}

/* 添加平滑过渡效果 */
:deep(.el-step__head),
:deep(.el-step__title),
:deep(.el-step__description),
:deep(.el-step__line) {
  transition: all 0.3s ease-in-out;
}
.el-steps {
  margin-bottom: 20px; /* 步骤条下方留白 */
}

.step-content {
  padding: 20px;
  background-color: #f9fafc; /* 内容背景色 */
  border: 1px solid #e0e6ed; /* 内容边框 */
  border-radius: 8px; /* 内容圆角 */
  min-height: 200px; /* 内容区的最小高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 16px;
  color: #606266; /* 内容文字颜色 */
}

.step-footer {
  margin-top: 20px; /* 与内容区域的间距 */
  display: flex;
  justify-content: space-between;
  width: 100%; /* 确保按钮与卡片宽度对齐 */
}

.el-button {
  padding: 10px 20px; /* 按钮内边距 */
  border-radius: 8px; /* 按钮圆角 */
}

.el-button[type="default"] {
  background-color: #f3f4f6; /* 默认按钮背景色 */
  color: #909399; /* 默认按钮文字颜色 */
}

.el-button[type="primary"] {
  background-color: #409eff; /* 主按钮背景色 */
  color: white; /* 主按钮文字颜色 */
}

.el-button:disabled {
  background-color: #e4e7ed; /* 禁用按钮背景色 */
  color: #c0c4cc; /* 禁用按钮文字颜色 */
}
</style>