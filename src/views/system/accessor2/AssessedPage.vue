<template>
    <div class="result-container">
      <!-- 添加返回按钮 -->
    <div class="page-header">
      <el-button 
        type="primary" 
        @click="handleBack"
        class="back-button"
      >
      <el-icon><ArrowLeft /></el-icon>
      返回
      </el-button>
    </div>
      <!-- 顶部标题和基本信息 -->
      <div class="header-section">
        <h2>项目信息总览</h2>
        <div class="project-info">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="项目名称">{{ projectInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ projectInfo.createTime }}</el-descriptions-item>
            <el-descriptions-item label="项目进度">
              <el-tag type="info">已完成</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="GSC功能点">
              <span class="final-fp">{{ finalFunctionPoints }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="FP功能点">
              <span class="final-fp">{{ finalFunctionPoints }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="项目状态">
              <el-tag type="info">待审查</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
  
      <!-- 功能点列表 -->
<div class="section">
  <h3><b>功能点清单</b></h3>
  <el-row :gutter="20" class="feature-cards">
    <el-col :span="8" v-for="(item, index) in featurePoints" :key="index">
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="feature-name">{{ item.name }}</span>
            <el-tag :type="getComplexityType(item.complexity)" size="small">
              {{ item.complexity }}
            </el-tag>
          </div>
        </template>
        <div class="card-content">
          <div class="info-item">
            <span class="label">分类：</span>
            <span>{{ item.category }}</span>
          </div>
          <div class="info-item">
            <span class="label">权重：</span>
            <span>{{ item.weight }}</span>
          </div>
          <div class="info-item description">
            <span class="label">描述：</span>
            <span>{{ item.description || '暂无描述' }}</span>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</div>
  
      <!-- GSC评分表 -->
<div class="section">
  <h3><b>通用系统特性(GSC)评分</b></h3>
  <el-table :data="formattedGscFactors" border stripe class="gsc-table">
    <el-table-column label="序号" width="60" align="center">
      <template #default="{ row }">
        {{ row.index1 }}
      </template>
    </el-table-column>
    <el-table-column prop="name1" label="特性名称" />
    <el-table-column label="得分" width="200" align="center">
      <template #default="{ row }">
        <el-rate
          v-model="row.score1"
          :max="5"
          disabled
          show-score
        />
      </template>
    </el-table-column>
    <el-table-column label="序号" width="60" align="center">
      <template #default="{ row }">
        {{ row.index2 }}
      </template>
    </el-table-column>
    <el-table-column prop="name2" label="特性名称" />
    <el-table-column label="得分" width="200" align="center">
      <template #default="{ row }">
        <el-rate
          v-model="row.score2"
          :max="5"
          disabled
          show-score
        />
      </template>
    </el-table-column>
  </el-table>
</div>
  
      <!-- 计算结果汇总 -->
      <div class="section summary-section">
        <h3><b>计算结果</b></h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="未调整功能点(UFP)">{{ calculations.ufp }}</el-descriptions-item>
            <el-descriptions-item label="技术复杂度因子(TCF)">{{ calculations.tcf }}</el-descriptions-item>
            <el-descriptions-item label="调整因子总分">{{ calculations.totalGsc }}</el-descriptions-item>
            <el-descriptions-item label="最终功能点(FP)">
              <span class="final-result">{{ finalFunctionPoints }}</span>
            </el-descriptions-item>
          </el-descriptions>
        <!-- </el-card> -->
      </div>
    </div>
  </template>
  
  <script>
  import { ArrowLeft } from '@element-plus/icons-vue'  // 正确的导入方式
  export default {
    name: 'AssessedPage',
    components: {
      ArrowLeft
    },
    data() {
      return {
        projectInfo: {
          name: '示例项目',
          createTime: '2024-03-18',
        },
        featurePoints: [], // 功能点列表
        gscFactors: [], // GSC因子列表
        calculations: {
          ufp: 0,
          tcf: 0,
          totalGsc: 0,
          fp: 0
        }
      }
    },
    computed: {
      finalFunctionPoints() {
        return this.calculations.fp.toFixed(2)
      },
      formattedGscFactors() {
      const result = [];
      for (let i = 0; i < this.gscFactors.length; i += 2) {
        const row = {
          index1: i + 1,
          name1: this.gscFactors[i].name,
          score1: this.gscFactors[i].score,
          index2: i + 2 <= this.gscFactors.length ? i + 2 : '',
          name2: this.gscFactors[i + 1]?.name || '',
          score2: this.gscFactors[i + 1]?.score || 0
        };
        result.push(row);
      }
        return result;
      }
    },
    methods: {
      handleBack() {
      this.$router.push('/accessor1')
    },
      getComplexityType(complexity) {
        const types = {
          '低': 'info',
          '中': 'warning',
          '高': 'danger'
        }
        return types[complexity] || 'info'
      },
      async fetchProjectInfo() {
        // TODO: 从后端获取项目基本信息
        this.projectInfo = {
          name: '示例项目',
          createTime: '2024-03-18'
        }
      },
      async fetchFeaturePoints() {
        // TODO: 从后端获取功能点列表
        this.featurePoints = [
          { name: '用户登录', category: 'EI', complexity: '低', weight: 3 },
          { name: '数据查询', category: 'EQ', complexity: '中', weight: 4 },
          { name: '数据查询', category: 'EQ', complexity: '中', weight: 4 }
        ]
      },
      async fetchGscFactors() {
        // TODO: 从后端获取GSC评分
        this.gscFactors = [
          { name: '数据通信', score: 4 },
          { name: '分布式处理', score: 3 },
          { name: '性能', score: 3 },
          { name: '配置', score: 3 },
          { name: '在线数据处理', score: 3 },
          { name: '复杂处理', score: 3 },
          { name: '可重用性', score: 3 },
          { name: '易用性', score: 3 },
          { name: '可移植性', score: 3 },
          { name: '可维护性', score: 3 },
          { name: '可使用性', score: 3 },
          { name: '可移植性', score: 3 },
          { name: '可维护性', score: 3 },
          { name: '可使用性', score: 3 }
        ]
      },
      async fetchCalculations() {
        // TODO: 从后端获取计算结果
        this.calculations = {
          ufp: 150,
          tcf: 1.05,
          totalGsc: 45,
          fp: 157.5
        }
      }
    },
    async created() {
      await Promise.all([
        this.fetchProjectInfo(),
        this.fetchFeaturePoints(),
        this.fetchGscFactors(),
        this.fetchCalculations()
      ])
    }
  }
  </script>
  
  <style scoped>
  .result-container {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
}

.back-button {
  font-size: 14px;
}
  
  .inline-descriptions :deep(.el-descriptions__body) {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.inline-descriptions :deep(.el-descriptions__table) {
  display: flex;
  width: 100%;
}

.inline-descriptions :deep(.el-descriptions__row) {
  display: flex;
  flex: 1;
}

.inline-descriptions :deep(.el-descriptions-item__cell) {
  flex: 1;
}
  .header-section {
    margin-bottom: 32px;
  }
  
  .feature-cards {
  margin-top: 20px;
}

.feature-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feature-name {
  font-weight: bold;
  font-size: 16px;
}

.card-content {
  color: #666;
}

.info-item {
  margin-bottom: 8px;
  line-height: 1.5;
}

.info-item .label {
  color: #909399;
  margin-right: 8px;
}

.description {
  margin-top: 12px;
  white-space: pre-wrap;
}
  h2 {
    margin-bottom: 20px;
    color: #303133;
    font-weight: 600;
  }
  
  h3 {
    margin-bottom: 16px;
    color: #606266;
    font-weight: 500;
  }
  
  .project-info {
    margin-bottom: 24px;
  }
  
  .final-fp {
    font-size: 20px;
    color: #409EFF;
    font-weight: bold;
  }
  
  .final-result {
    font-size: 24px;
    color: #67c23a;
    font-weight: bold;
  }
  
  :deep(.el-descriptions) {
    margin-bottom: 16px;
  }
  
  :deep(.el-table) {
    margin-bottom: 24px;
  }
  .gsc-table :deep(.el-table__header) th {
  background-color: #f5f7fa;
}

  </style>