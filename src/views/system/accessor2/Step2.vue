<template>
  <div class="step2-container">
    <div class="header">
      <el-icon><List /></el-icon>
      <h3>功能点分类与复杂度选择</h3>
    </div>
    <el-row :gutter="20">
      <!-- 遍历功能点 -->
      <el-col :xs="24" :sm="12" v-for="(point, index) in featurePoints" :key="index">
        <el-card class="feature-card" shadow="hover">
          <!-- 功能点序号和名称 -->
          <el-row class="feature-inputs" :gutter="10" align="middle">
            <el-col :span="24">
              <el-input v-model="point.funcName" type="text"disabled>
                <template #prepend>
                  <!-- 功能点序号 -->
                  <span class="point-index">功能点 {{ index + 1 }}</span>
                </template>
                <template #append>
                  <!-- 分类和复杂度标签 -->
                  <div class="tags-container">
                    <el-tag v-if="point.tag" type="primary">{{ point.tag }}</el-tag>
                    <el-tag v-if="point.diff" :type="complexityType(point.diff)">
                      {{ point.diff }}
                    </el-tag>
                  </div>
                </template>
              </el-input>
            </el-col>
          </el-row>

          <!-- 分类和复杂度下拉框 -->
          <el-row :gutter="10" class="feature-inputs">
            <el-col :span="12">
              <el-select v-model="point.tag" placeholder="选择分类">
                <el-option v-for="(category, index) in categories" :key="index" :label="category" :value="category" />
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-select v-model="point.diff" placeholder="选择复杂度">
                <el-option v-for="(complexity, index) in complexities" :key="index" :label="complexity" :value="complexity" />
              </el-select>
            </el-col>
          </el-row>

          <!-- 功能点描述 -->
          <el-row class="feature-inputs">
            <el-col :span="24">
              <el-input
                v-model="point.funcDescr"
                type="textarea"
                disabled
                :rows="3"
              ></el-input>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Step2',
  props: {
    featurePoints: Array
  },
  data() {
    return {
      categories: ['EI(外部接口)', 'EQ(外部查询)', 'EO(外部输出)', 'ILF(内部逻辑文件)', 'EIF(外部接口文件)'],
      complexities: ['低', '中', '高']
    };
  },
  computed: {
    // 校验：所有功能点的分类和复杂度是否填写完整
    isValid() {
      return this.featurePoints.every(point => point.tag && point.diff);
    }
  },
  watch: {
    // 监听校验结果，通知父组件
    isValid: {
      handler(newVal) {
        this.$emit('validate', newVal); // 通知父组件当前校验状态
      },
      immediate: true // 初始化时立即触发校验
    }
  },
  methods: {
    // 根据复杂度返回对应的标签类型
    complexityType(complexity) {
      switch (complexity) {
        case '低':
          return 'success';
        case '中':
          return 'warning';
        case '高':
          return 'danger';
        default:
          return 'info';
      }
    }
  }
};
</script>


<style scoped>
.step2-container {
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
.feature-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 350px;
  border-radius: 8px;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.feature-inputs {
  margin-bottom: 15px;
}

.feature-inputs el-input {
  margin-bottom: 10px;
}

.feature-inputs el-select {
  width: 100%;
}

/* 样式：功能点序号 */
.point-index {
  font-weight: bold;
  color: #409eff;
}

/* 标签容器样式 */
.tags-container {
  display: flex;
  gap: 5px;
}

/* 优化功能点描述的输入框 */
textarea.el-textarea__inner {
  resize: none;
}

/* 响应式布局优化 */
@media (max-width: 768px) {
  .feature-card {
    margin-bottom: 15px;
  }

  .feature-inputs {
    margin-bottom: 10px;
  }
}
</style>
