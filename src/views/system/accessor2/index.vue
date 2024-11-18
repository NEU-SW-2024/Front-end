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
        <Step1 v-if="activeStep === 1" :featurePoints="featurePoints" @addPoint="addFeaturePoint" @deletePoint="deleteFeaturePoint" @validate="handleValidation"/>
        <!-- 步骤 2: 功能点分类与复杂度选择 -->
        <Step2 v-if="activeStep === 2" :featurePoints="featurePoints" @prevStep="goToPrevStep" />
        <!-- 步骤 3: 计算未调整功能点（UFP） -->
        <Step3 v-if="activeStep === 3" :featurePoints="featurePoints" :projectId="projectId" @prevStep="goToPrevStep" @nextStep="goToNextStep"/>
        <!-- 步骤 4: 复杂度调整 -->
        <Step4 v-if="activeStep === 4" :adjustmentFactors="adjustmentFactors" :projectId="projectId" @prevStep="goToPrevStep" @nextStep="goToNextStep" />
        <!-- 步骤 5: 功能点分析结果 -->
        <Step5 v-if="activeStep === 5" :adjustmentFactors="adjustmentFactors" :featurePoints="featurePoints" :projectId="projectId" @prevStep="goToPrevStep" />
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
import Step1 from './Step1.vue';
import Step2 from './Step2.vue';
import Step3 from "./Step3.vue";
import Step4 from './Step4.vue';
import Step5 from "./Step5.vue";

export default {
  name: 'Index',
  components: {
    Step1,
    Step2,
    Step3,
    Step4,
    Step5
  },
  data() {
    return {
      activeStep: 1, // 当前激活的步骤
      steps: [
        {title: '功能点识别录入'},
        {title: '功能点分类'},
        {title: '计算未调整功能点'},
        {title: '复杂度调整'},
        {title: '计算调整功能点'},
      ],
      projectId: 1, // 新增1:用于存储项目ID，先假设为1
      featurePoints: [{name: '', description: '', category: '', complexity: '', points: 0}], // 功能点数据
      isStepValid: false, // 当前步骤的验证状态
      adjustmentFactors: [{name: '数据通信（Data Communications）', point: ''},
        {name: '分布式数据处理（Distributed Data Processing）', point: ''},
        {name: '性能（Performance）', point: ''},
        {name: '重度配置（heavily used configuration）', point: ''},
        {name: '处理速率（transaction rate）', point: ''},
        {name: '在线数据输入（online data entry）', point: ''},
        {name: '最终用户使用效率（end user efficiency）', point: ''},
        {name: '在线升级（online update）', point: ''},
        {name: '复杂处理（complex processing）', point: ''},
        {name: '可重用性（Reusability）', point: ''},
        {name: '易安装性（installation ease）', point: ''},
        {name: '易操作性（operational ease）', point: ''},
        {name: '多场所（multiple sites）', point: ''},
        {name: '支持变更（facilitate change）', point: ''},
      ], // 复杂度调整因子
      projectProgress: 0,
    };
  },
  mounted() {
    // 如果有路由参数，则覆盖默认的 projectId 值
    if (this.$route.params.projectId) {
      this.projectId = this.$route.params.projectId;
    }
    console.log('Project ID:', this.projectId); // 用于调试，确保参数已正确接收
  },
  methods: {
    // 添加新的功能点
    addFeaturePoint() {
      this.featurePoints.push({name: '', description: '', category: '', complexity: ''});
    },
    // 删除功能点
    deleteFeaturePoint(index) {
      this.featurePoints.splice(index, 1);
    },
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
        // 当点击"返回"按钮时才跳转
        this.$router.push({path: `/accessor3`});
        console.log("确认")
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
      const names = this.featurePoints.map((point) => point.name.trim());
      return (
          this.featurePoints.length > 0 &&
          names.every((name) => name !== '') &&
          names.length === new Set(names).size
      );
    },
    // 校验步骤二：检查每个功能点是否选择了分类和复杂度
    validateStep2() {
      return this.featurePoints.every(point => point.category && point.complexity);
    },
    // 校验步骤4
    validateStep4() {
  // 检查是否所有GSC因子都已评分
  return this.adjustmentFactors.every(factor => 
    typeof factor.point === 'number' && factor.point >= 0 && factor.point <= 5
  );
},
    handleValidation(isValid) {
      this.isStepValid = isValid;
    },

    // 返回按钮的跳转方法
    goBack() {
      this.$router.push({path: '/home'}); // 返回到主页
    }
  },
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