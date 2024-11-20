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
        <div class="factor-name">{{ factor.measureName }}</div>

        <!-- 进度条 -->
        <el-slider
            v-model="factor.di"
            :min="0"
            :max="5"
            :step="1"
            class="factor-slider"
            :disabled="isReadOnly"
            :marks="sliderMarks"
        ></el-slider>
        <span class="score-display">{{ factor.di }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'Step4',
  props: {
    featurePoints: {
      type: Array,
      required: true,
    },
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
      featurePoints: this.featurePoints
    }
  },
  computed: {
    isReadOnly() {
      return this.step > 1;
    },
    totalScore() {
      return this.adjustmentFactors.reduce((sum, factor) => sum + factor.di, 0);
    }
  },
  methods: {
    convertDiffToNumber(diff) {
      const diffMap = {
        '低': 0,
        '中': 1,
        '高': 2
      };
      // 移除可能存在的"复杂度"文字
      const cleanDiff = diff.replace('复杂度', '');
      return diffMap[cleanDiff] ?? 0; // 如果没有匹配到，默认返回0
    },
    convertTag(tag) {
      // 移除括号及其中的内容
      return tag.split('(')[0];
    },
    async saveFeaturePoints() {

try {
  const formattedFeaturePoints = this.featurePoints.map(point => ({
          projectId: point.projectId,
          funcName: point.funcName,
          funcDescr: point.funcDescr,
          tag: this.convertTag(point.tag),
          diff: this.convertDiffToNumber(point.diff), // 转换复杂度为数字
          points: point.points || 0
        }));
        
        console.log('发送到后端的数据:', formattedFeaturePoints);
    // 发送 POST 请求到后端保存功能点
    const response = await request({
      url: '/dev-api/accessor/saveFunc',
      method: 'post',
      data: formattedFeaturePoints
    })

  if (response.code === 200) {
    console.log('功能点保存成功:', response.data.feats);
  } else {
    console.error('保存功能点失败:', response.data.message);
  }
} catch (error) {
  console.error('保存功能点时出错:', error);
  this.$modal.msgError('保存失败，请重试');
}
},
    // 添加新的功能点
    addFeaturePoint() {
  if (!this.projectId) {
    this.$message.error('无法添加功能点：项目 ID 无效！');
    return;
  }

  console.log('projectId:', this.projectId);
  this.featurePoints.push({
    projectId: this.projectId,
    funcName: '',
    funcDescr: '',
    tag: '',
    diff: '',
    points: 0,
  });

  
},
  },
  mounted() {
    console.log(this.featurePoints);
    if (this.featurePoints && this.featurePoints.length > 0) {
      this.saveFeaturePoints();
    }
  }
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