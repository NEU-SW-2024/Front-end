<template>
  <div class="step1-container">
    <!-- 标题部分 -->
    <div class="header">
      <el-icon><Edit /></el-icon>
      <h3>填写功能点</h3>
    </div>

    <!-- 功能点列表 -->
    <div class="feature-point-list">
      <el-row :gutter="20">
        <el-col :span="12" v-for="(point, index) in featurePoints" :key="index">
          <el-card class="feature-card" shadow="hover">
            <!-- 功能点标题和删除按钮 -->
            <div class="feature-header">
              <div class="feature-point-label">功能点 {{ index + 1 }}</div>
              <el-button
                  type="danger"
                  circle
                  size="small"
                  @click="deletePoint(index)"
                  :disabled="isReadOnly"
                  class="delete-btn"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <!-- 功能点表单 -->
            <div class="feature-form">
              <!-- 名称输入框 -->
              <el-input
                  v-model="point.funcName"
                  placeholder="请输入功能点名称"
                  maxlength="10"
                  show-word-limit
                  :disabled="isReadOnly"
                  @input="validateName(index)"
              >
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-input>
              <div v-if="validationErrors[index]" class="error-message">
                {{ validationErrors[index] }}
              </div>

              <!-- 描述输入框 -->
              <el-input
                  v-model="point.funcDescr"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入功能点描述"
                  maxlength="30"
                  show-word-limit
                  :disabled="isReadOnly"
                  class="description-input"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 添加调整因子的按钮 (右侧) -->
      <el-icon type="plus" class="add-point-btn" @click="addFeaturePoint" :disabled="isReadOnly">
        <Plus />
      </el-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Step1',
  props: {
    projectId: {
      type: [Number, String],
      required: true
    },
    featurePoints: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      validationErrors: [], // 存储校验错误消息
    };
  },
  computed: {
    // 是否所有功能点的名称都填写且唯一
    isValid() {
      const names = this.featurePoints.map((point) => point.funcName.trim());
      return (
          this.featurePoints.length > 0 &&
          names.every((funcName) => funcName !== '') &&
          names.length === new Set(names).size &&
          this.validationErrors.every((error) => error === '')
      );
    },
  },
  created() {
    // 检查是否需要初始化一个默认功能点
    if (this.featurePoints.length === 0) {
      this.addFeaturePoint();
    }
  },
  methods: {
    // 添加新功能点
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

      console.log('功能点已更新:', this.featurePoints);
    },
    // 删除功能点
    deletePoint(index) {
      this.featurePoints.splice(index, 1);
      this.validationErrors.splice(index, 1); // 同步移除对应的错误信息
      // this.$emit('deletePoint', index);
    },
    validateName(index) {
      const name = this.featurePoints[index].funcName.trim();
      if (!name) {
        this.validationErrors[index] = '功能点名称不能为空';
      } else if (
          this.featurePoints.some((point, idx) => idx !== index && point.funcName.trim() === name)
      ) {
        this.validationErrors[index] = '功能点名称不能重复';
      } else {
        this.validationErrors[index] = ''; // 清空错误信息
      }
    },
  },
};
</script>

<style scoped>
.step1-container {
  padding: 24px;
  border-radius: 8px;
  width: 1200px;  /* 固定容器宽度 */
}

.header {
  display: flex;
  align-items: center;
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

.feature-point-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-card {
  margin-bottom: 20px;
  border-radius: 8px;
  min-width: 350px;  /* 卡片最小宽度 */
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.feature-point-label {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.feature-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.description-input {
  margin-top: 8px;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: -15px;
  margin-left: -200px;
}

.add-point-btn {
  background-color: #409eff;
  color: #ffffff;
  font-size: 30px;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  box-shadow: 0px 4px 10px rgba(64, 158, 255, 0.2);
  right: -880px;     /* 调整右侧距离 */
  bottom: 30px;    /* 调整底部距离 */
  z-index: 10;
  position:relative;
}


.add-point-btn:hover {
  background-color: #66b1ff;
}

.add-point-btn:active {
  background-color: #3a8ee6;
}

/* 添加禁用状态样式 */
.add-point-btn[disabled] {
  background-color: #a0cfff;
  cursor: not-allowed;
}

:deep(.el-input__prefix) {
  color: #909399;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}
</style>