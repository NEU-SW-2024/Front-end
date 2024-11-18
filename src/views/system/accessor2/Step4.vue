<template>
  <div class="step4-container">
    <div class="header">
      <el-icon><Setting /></el-icon>
      <h3>通用系统特性(GSC)评分</h3>
      <div class="total-score">
        <span class="total-label">总分：</span>
        <span class="total-number">{{ totalScore }}</span>
        <span class="total-max">/70</span>
      </div>
    </div>

    <div class="factor-list">
      <div class="factor-item" v-for="(factor, index) in adjustmentFactors" :key="index">
        <div class="factor-index">{{ index + 1 }}.</div>
        
        <!-- GSC名称 -->
        <div class="factor-name">{{ factor.name }}</div>

        <!-- 进度条 -->
        <el-slider
            v-model="factor.point"
            :min="0"
            :max="5"
            :step="1"
            class="factor-slider"
            :disabled="isReadOnly"
            :marks="sliderMarks"
        ></el-slider>
        <span class="score-display">{{ factor.point }}</span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Step4',
  props: {
    adjustmentFactors: {
      type: Array,
      required: true,
    },
    projectId: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      sliderMarks: {
        0: '无影响',
        1: '偶然影响',
        2: '适度影响',
        3: '平均影响',
        4: '重要影响',
        5: '强烈影响'
      },
      totalScore: 0,
    }
  },
  computed: {
    isReadOnly() {
      return this.step > 1;
    },
    totalScore() {
      return this.adjustmentFactors.reduce((sum, factor) => sum + factor.point, 0);
    }
  },
};
</script>

<style scoped>
.step4-container {
  padding: 24px;
  border-radius: 8px;
  width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 修改：使左右两侧分开 */
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-label {
  font-size: 16px;
  color: #606266;
}

.total-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.total-max {
  font-size: 16px;
  color: #909399;
}

.header h3 {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

.header .el-icon {
  font-size: 24px;
  color: #409EFF;
}

.factor-list {
  margin-top: 20px;
}

.factor-item {
  display: flex;
  align-items: left;
  margin-bottom: 20px;
}

.factor-name {
  width: 200px;
  margin-right: 20px;
  font-size: 14px;
  white-space: nowrap;        /* 添加：防止文本换行 */
}


.factor-name {
  text-align: left;
  width: 200px;
  font-size: 14px;
}

.factor-slider {
  margin-left: 100px;
  width: 400px;
  margin-right: 20px;
}

.score-display {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
  width: 30px;
}

:deep(.el-slider__marks-text) {
  font-size: 12px;
  white-space: nowrap;
}
</style>