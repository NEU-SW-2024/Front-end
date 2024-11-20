<template>
  <div class="step3-container">
    <!-- 项目名称和未调整功能点数 (UFP) -->
    <div class="header">
      <el-icon><Document /></el-icon>
      <h3>未调整功能点数</h3>
    </div>

    <!-- 显示Loading状态 -->
    <el-loading :loading="loading" text="数据加载中..." :fullscreen="true" />
    <template v-if="featurePoints && featurePoints.length">
    <!-- 功能点表格 -->
    <el-table
        :data="featurePoints"
        border
        style="width: 100%"
        :header-cell-style="{
          background: '#f5f7fa',
          color: '#303133',
          fontWeight: 'bold',
          fontSize: '15px',
          textAlign: 'center',
          height: '50px'
        }"
        :cell-style="{
          textAlign: 'center',
          color: '#606266',
          fontSize: '14px',
          padding: '12px 0'
        }"
        class="feature-table"
    >
    <el-table-column prop="funcName" label="功能名称" />
      <el-table-column prop="funcDescr" label="功能描述" />
      <el-table-column prop="tag" label="功能类型">
        <template #default="scope">
          {{ scope.row.tag }}
        </template>
      </el-table-column>
      <el-table-column prop="diff" label="复杂度">
        <template #default="scope">
          {{ scope.row.diff }}复杂度
        </template>
      </el-table-column>
      <el-table-column prop="points" label="功能点分值">
        <template #default="scope">
          {{ calculatePoints(scope.row) || 0 }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 显示总分 -->
    <div class="total-points">
      总功能点数：{{ totalPoints }}
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'Step3',
  props: {
    featurePoints: {
      type: Array,
      required: true
    },
    projectId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      loading: true,  // 控制加载动画
      projectInfo: {
        projectName: '示例项目',  // 示例项目名称
        ufp: 0  // 初始未调整功能点数
      },
      // 权重值对照表
      weightTable: {
        'EI(外部接口)': { '低': 3, '中': 4, '高': 6 },
        'EO(外部输出)': { '低': 4, '中': 5, '高': 7 },
        'EQ(外部查询)': { '低': 3, '中': 4, '高': 6 },
        'ILF(内部逻辑文件)': { '低': 7, '中': 10, '高': 15 },
        'EIF(外部接口文件)': { '低': 5, '中': 7, '高': 10 },
      }
    };
  },
  computed: {
    totalPoints() {
      return this.featurePoints.reduce((sum, point) => {
        return sum + this.calculatePoints(point)
      }, 0)
    }
  },
  methods: {
    calculatePoints(point) {
      if (!point || !point.tag || !point.diff) {
        return 0;
      }
      
      try {
        // 移除复杂度后面的"复杂度"文字
        const diff = point.diff.replace('复杂度', '');
        
        // 直接使用完整的tag名称
        if (this.weightTable[point.tag] && this.weightTable[point.tag][diff]) {
          return this.weightTable[point.tag][diff];
        }
        
        console.warn('无法找到对应的权重值:', {
          tag: point.tag,
          diff: diff,
          availableTags: Object.keys(this.weightTable)
        });
        return 0;
      } catch (error) {
        console.error('计算分值时出错:', error);
        return 0;
      }
    },
    
  },
  created() {
    // 调试输出
    console.log('接收到的功能点数据:', this.featurePoints);
    if (this.featurePoints.length > 0) {
      console.log('第一个功能点的tag和diff:', {
        tag: this.featurePoints[0].tag,
        diff: this.featurePoints[0].diff
      });
    }
  }
};
</script>

<style scoped>
.step3-container {
  padding: 24px;
  border-radius: 8px;
  width: 1200px;  /* 固定容器宽度 */
  margin: 0 auto;  /* 居中显示 */
}
.header {
  display: flex;
  align-items: left;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
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
.project-info {
  margin-bottom: 20px;
  font-size: 20px; /* 增大字体 */
  font-weight: bold;
  color: #333; /* 字体颜色 */
}

.el-table {
  margin-top: 20px;
  width: 100%; /* 确保表格宽度为父容器的100% */
  max-width: 100%; /* 避免表格超出容器 */
  table-layout: fixed; /* 固定布局 */
  word-wrap: break-word; /* 自动换行 */
  overflow: hidden; /* 避免内容溢出 */
}

.el-table .el-table__header th {
  background-color: #007bff; /* 表头背景颜色 */
  color: white; /* 表头字体颜色 */
}

.el-table-column {
  width: 150px; /* 设置每列的固定宽度 */
}

.el-table .el-table__body td {
  text-align: center;
  word-break: break-word; /* 强制换行，防止超出列宽 */
  overflow: hidden;
  text-overflow: ellipsis; /* 超出内容显示省略号 */
}

.el-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.ufp-container {
  margin-top: 20px;
  font-size: 16px;
  color: #409eff;
  font-weight: bold;
}

.feature-table {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.points-value {
  color: #409EFF;
  font-weight: bold;
  font-size: 15px;
}

:deep(.el-table) {
  border: none !important;
}

:deep(.el-table::before) {
  display: none;
}

:deep(.el-table__inner-wrapper::before) {
  display: none;
}

:deep(.el-table--border) {
  border-radius: 8px;
}

:deep(.el-table__row) {
  transition: background-color 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}

:deep(.el-table--striped .el-table__row--striped) {
  background-color: #fafafa;
}
.total-points {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  color: #67c23a;
  font-weight: bold;
  text-align: right;
  font-size: 16px;
}
</style>