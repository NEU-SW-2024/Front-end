<template>
  <div class="step5-container">
    <el-row class="content-row">
      <!-- 左侧部分 -->
      <el-col :span="12" class="section-col left-section">
        <div class="section-header">
          <el-icon><DataLine /></el-icon>
          <h3 class="section-title">通过 GSC 方法调整功能点数</h3>
        </div>
        <el-timeline class="calculation-timeline">
          <!-- GSC计算卡片 -->
          <el-timeline-item placement="top">
            <el-card class="calc-card" shadow="hover">
              <div class="card-content">
                <h4 class="card-title">
                  <el-icon><Operation /></el-icon>
                  GSC计算
                </h4>
                <div class="formula-box">
                  <span class="formula-text">GSC = Σ(di)</span>
                </div>
                <div class="data-box">
                  <p class="data-text">GSC = {{ measureData.gsc }}</p>
                </div>
                <div class="result-box">
                  <span class="label">计算结果：</span>
                  <span class="value">{{ measureData.gsc }}</span>
                </div>
              </div>
            </el-card>
          </el-timeline-item>

          <!-- VAF计算卡片 -->
          <el-timeline-item placement="top">
            <el-card class="calc-card" shadow="hover">
              <div class="card-content">
                <h4 class="card-title">
                  <el-icon><Operation /></el-icon>
                  VAF计算
                </h4>
                <div class="formula-box">
                  <span class="formula-text">VAF = 0.65 + 0.01 × GSC</span>
                </div>
                <div class="data-box">
                  <p class="data-text">GSC = {{ measureData.gsc }}</p>
                </div>
                <div class="result-box">
                  <span class="label">VAF：</span>
                  <span class="value">{{ (0.65 + 0.01 * measureData.gsc).toFixed(2) }}</span>
                </div>
              </div>
            </el-card>
          </el-timeline-item>

          <!-- DFP计算卡片 -->
          <el-timeline-item placement="top">
            <el-card class="calc-card" shadow="hover">
              <div class="card-content">
                <h4 class="card-title">
                  <el-icon><Operation /></el-icon>
                  DFP计算
                </h4>
                <div class="formula-box">
                  <span class="formula-text">DFP = UFP × VAF</span>
                </div>
                <div class="data-box">
                  <p class="data-text">UFP = {{ measureData.upf }}</p>
                </div>
                <div class="result-box">
                  <span class="label">DFP：</span>
                  <span class="value">{{ (measureData.upf * (0.65 + 0.01 * measureData.gsc)).toFixed(2) }}</span>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-col>

      <!-- 右侧部分 -->
      <el-col :span="12" class="section-col right-section">
        <div class="section-header">
          <el-icon><TrendCharts /></el-icon>
          <h3 class="section-title">规模变更调整因子法调整功能点数</h3>
        </div>
        <el-timeline class="calculation-timeline">
          <!-- CF因子卡片 -->
          <el-timeline-item placement="top">
            <el-card class="calc-card" shadow="hover">
              <div class="card-content">
                <h4 class="card-title">
                  <el-icon><Operation /></el-icon>
                  CF因子
                </h4>
                <div class="result-box">
                  <span class="label">项目进度：</span>
                  <span class="value">{{ measureData.cf }}</span>
                </div>
              </div>
            </el-card>
          </el-timeline-item>

          <!-- S计算卡片 -->
          <el-timeline-item placement="top">
            <el-card class="calc-card" shadow="hover">
              <div class="card-content">
                <h4 class="card-title">
                  <el-icon><Operation /></el-icon>
                  S计算
                </h4>
                <div class="formula-box">
                  <span class="formula-text">S = UPF × CF</span>
                </div>
                <div class="data-box">
                  <p class="data-text">UPF = {{ measureData.upf }}</p>
                </div>
                <div class="result-box">
                  <span class="label">S：</span>
                  <span class="value">{{ (measureData.upf * measureData.cf).toFixed(2) }}</span>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from 'axios';
import request from "@/utils/request.js";

export default {
  name: "Step5",
  props: {
    measureData: {
      type: Object,
      required: true
    },
    adjustmentFactors: {
      type: Array,
      required: true
    },
    projectId: {
      type: Number,
      required: true
    },
    projectProgress: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      measureData: {
        gsc: 0,
        upf: 0,
        vaf: 0,
        dfp: 0,
        cf: 0,
        s: 0,
        status: 0
      }
    };
  },
  async created() {
  // 在保存调整因子之前，给 adjustmentFactors 中每个对象的 projectId 赋值为 this.projectId
  this.adjustmentFactors.forEach(item => {
    item.projectId = this.projectId; // 将 projectId 设置为当前组件的 projectId
  });

  // 保存调整因素到后端并获取保存后的信息
  const saveSuccess = await this.saveAdjustmentFactors();
  if (saveSuccess) {
    // 如果保存成功，获取最新的项目相关信息
    await this.fetchData();
  }
},

  methods: {
    // 保存调整因子信息
    async gotoAssessedPage(){
      console.log("gotoAssessedPage")
      console.log("gotoAssessedPage"+ this.projectId)
      this.$router.push({path: `/accessor3`,
        query: { projectId: this.projectId }
      });
    },
    async fetchData() {
  try {
    const response = await request({
      url: '/dev-api/accessor/getAll',
      method: 'get',
      params: { projectId: this.projectId }
    });
    console.log(response.code)
    if (Number(response.code) === 200) {
      this.measureData = response.data.measureRes;
      console.log("qqqqqq"+this.measureData.dfp)
      this.$message.success('保存成功');
      return true; // 返回成功标志
    } else {
      this.$message.error(response?.msg || '保存失败');
      console.error('保存失败原因:', response); // 详细记录错误
      return false;
    }
  } catch (error) {
    console.error('保存出现异常:', error); // 详细记录异常
    this.$message.error('保存失败，请稍后重试');
    return false;
  }
},
async saveAdjustmentFactors() {
  try {
    const cf = this.projectProgress;
    console.log("1-Adjustment Factors before request:", this.adjustmentFactors);

    const response = await request({
      url: `/dev-api/accessor/saveMeasure/${cf}`,
      method: 'post',
      data: this.adjustmentFactors,
      headers: {
        'Content-Type': 'application/json', // 设置请求头为 JSON
      },
    });

    if (response.code === 200) {
      console.log("调整因子保存成功");
      return true; // 返回成功标志
    } else {
      console.error("保存失败");
      return false; // 返回失败标志
    }
  } catch (error) {
    console.error("保存调整因子出错:", error);
    return false; // 返回失败标志
  }
},
  }
};
</script>

<style scoped>
.step5-container {
  padding: 24px;
  /* background-color: #f5f7fa; */
  min-height: calc(100vh - 48px);
}

.content-row {
  background: transparent;
  margin: 0 -12px;
}

.section-col {
  padding: 0 20px;
}

.left-section {
  border-right: 1px dashed #dcdfe6;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.section-header .el-icon {
  font-size: 24px;
  color: #409eff;
}

.section-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.calculation-timeline {
  padding: 0 12px;
}

.calc-card {
  width: 100%;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.calc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}

.formula-box {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.formula-text {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #606266;
}

.data-box {
  margin-bottom: 16px;
}

.data-text {
  color: #606266;
  margin: 0;
}

.result-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ecf5ff;
  padding: 12px;
  border-radius: 4px;
}

.result-box .label {
  color: #606266;
  font-weight: 500;
}

.result-box .value {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-timeline-item__node) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-timeline-item__tail) {
  border-left-color: #dcdfe6;
}
</style>