<template>
  <div class="step3-container">
    <!-- 项目名称和未调整功能点数 (UFP) -->
    <div class="header">
      <el-icon><Document /></el-icon>
      <h3>未调整功能点数</h3>
    </div>

    <!-- 显示Loading状态 -->
    <el-loading :loading="loading" text="数据加载中..." :fullscreen="true" />

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
      <el-table-column prop="name" label="功能点名称" min-width="180" />
      <el-table-column prop="category" label="功能点分类" width="150" />
      <el-table-column prop="complexity" label="功能点复杂度" width="150" />
      <el-table-column prop="points" label="功能点分数" width="150">
        <template #default="{ row }">
          <span class="points-value">{{ row.points }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- UFP计算结果展示 -->
    <div class="ufp-container">
      <template v-for="(point, index) in featurePoints" :key="index">
        {{ point.points }}<span v-if="index < featurePoints.length - 1"> + </span>
      </template>
      = {{ projectInfo.ufp }}（UFP）
    </div>
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
      localFeaturePoints: [] // 新增本地数据
    };
  },
  methods: {
    async saveFeaturePoints() {
      // 准备假设的功能点数据
      const fakeFeaturePoints = [
        {
          projectId: this.projectId,
          funcName: '功能点1',
          funcDescr: '描述1',
          tag: '分类1',
          diff: 3
        },
        {
          projectId: this.projectId,
          funcName: '功能点2',
          funcDescr: '描述2',
          tag: '分类2',
          diff: 5
        },
        {
          projectId: this.projectId,
          funcName: '功能点3',
          funcDescr: '描述3',
          tag: '分类3',
          diff: 8
        }
      ];

      try {
        this.loading = true;
        // 发送 POST 请求到后端保存功能点
        const response = await this.$axios.post('/accessor/saveFunc', fakeFeaturePoints);

        if (response.code===1) {
          console.log('功能点保存成功:', response.data.feats);
          // 模拟保存后的操作，假设后端返回更新的 featurePoints 和 UFP
          this.localFeaturePoints = response.data.feats || fakeFeaturePoints;
      /*    this.projectInfo.ufp = response.data.projectInfo?.ufp || 16; // 假设的 UFP*/
          //直接遍历计算UFP，是localFeaturePoints 中的
        } else {
         /* console.error('保存功能点失败:', response.data.message);*/
        }
      } catch (error) {
       /* console.error('保存功能点时出错:', error);*/
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.saveFeaturePoints();  // 初始调用保存功能点数据
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
</style>