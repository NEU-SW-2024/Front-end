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
          <el-descriptions-item label="GSC">
            <span class="final-fp">{{ calculations.gsc }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="UPF未调整功能点">
            <span class="final-fp">{{ calculations.upf }}</span>
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
          <el-descriptions-item label="未调整功能点(UFP)">{{ calculations.upf }}</el-descriptions-item>
          <el-descriptions-item label="技术复杂度因子(TCF)"> <span class="final-result">{{ calculations.dfp }}</span></el-descriptions-item>
          <el-descriptions-item label="调整因子总分">{{ calculations.gsc }}</el-descriptions-item>
          <el-descriptions-item label="规模调整功能点数(S)">
            <span class="final-result">{{calculations.s }}</span>
          </el-descriptions-item>
        </el-descriptions>
      <!-- </el-card> -->
    </div>
  </div>
</template>

<script>
import { ArrowLeft } from '@element-plus/icons-vue'
import request from "@/utils/request.js";  // 正确的导入方式
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
      featureScore:[],// 功能点得分列表
      gscFactors: [], // GSC因子列表
      calculations: {
        projectId: 0,
        status:0,
        cf:null,
        upf:0,
        s:0,
        vaf: 0,
        dfp: 0,
        gsc: 0
      },
      projectId: null
    }
  },

  computed: {
    // finalFunctionPoints() {
    //   return this.calculations.fp.toFixed(2)
    // },
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
    async fetchData() {
      try {
        const response = await request({
          url: '/dev-api/accessor/getAll',
          method: 'get',
          params: { projectId: this.projectId }
        });

        if (response.code === 200) {
          // 处理后端返回的数据并存储到对应变量
          const { feats, measures, measureRes, featScores } = response.data;

          // 将 featScores 转为哈希表结构，便于快速查找
          const scoreMap = Object.fromEntries(featScores.map(score => [score.scoreId, score]));
          // 功能点数据映射
          this.featurePoints = feats.map(item => {
            const scoreInfo = scoreMap[item.scoreId]; // 查找对应的评分信息

            return {
              name: item.featName,
              description: item.featDescr,
              category: scoreInfo?.featTag || '', // 分类字段，映射自 featTag
              complexity:
                  scoreInfo?.featDiff === '0'
                      ? '简单'
                      : scoreInfo?.featDiff === '1'
                          ? '中等'
                          : scoreInfo?.featDiff === '2'
                              ? '复杂'
                              : '', // 复杂度字段，映射自 featDiff
              weight: scoreInfo?.score || 0 // 权重字段，映射自 score
            };
          });

          // GSC 因子数据映射
          this.gscFactors = measures.map(item => ({
            name: item.measureName,
            score: item.di
          }));
/* 
          // 计算结果数据映射
          if (measureRes.length > 0) {
            const res = measureRes;
            this.calculations = {
              ufp: res.upf,
              tcf: res.cf,
              totalGsc: res.gsc,
              fp: res.dfp || 0,
              vaf: res.vaf
            };
          } */
         this.calculations = response.data.measureRes;
        } else {
          console.error("获取数据失败:", response.msg);
        }
      } catch (error) {
        console.error("获取数据出错:", error);
      }
    }


  },
  mounted() {
    console.log('完整的路由信息:', this.$route);
    console.log('路由查询参数:', this.$route.query);

    const projectIdParam = this.$route.query.projectId;
    const converted = Number(projectIdParam);

    console.log('原始参数:', projectIdParam);
    console.log('转换结果:', converted);
    console.log('是否为 NaN:', isNaN(converted));

    this.projectId = !isNaN(converted) ? converted : null;
    console.log('Project ID:', this.projectId); // 用于调试，确保参数已正确接收

    this.fetchData();
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