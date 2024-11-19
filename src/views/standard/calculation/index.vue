<template>
  <div class="main-container">
    <!-- 搜索框部分 -->
    <div class="search-wrapper">
      <el-input 
        v-model="searchQuery" 
        placeholder="搜索项目" 
        class="search-input"
        @keyup.enter="performSearch">
        <template #append>
          <el-button type="primary" @click="performSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 卡片容器 -->
    <div class="card-container">
      <el-card 
        v-for="project in filteredProjects" 
        :key="project.id" 
        class="project-card" 
        shadow="hover">
        <div class="card-content">
          <!-- 卡片标题区 -->
          <div class="card-header">
            <h3 class="card-title">{{ project.name }}</h3>
            <el-tag 
              :type="getStatusType(project.status)" 
              class="status-tag">
              {{ project.status }}
            </el-tag>
          </div>
          
          <!-- 卡片主体区 -->
          <div class="card-body">
            <p class="card-description">{{ decodeBase64Text(project.description.text) }}</p>
            <img 
              v-if="project.description.image && project.description.image.trim() !== ''" 
              :src="'./images/neu_logo_l.jpg'" 
              alt="项目图片" 
              class="card-image" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 开始评估按钮 -->
    <div class="action-section">
      <el-button 
        type="primary"
        size="large"
        class="evaluate-button"
        @click="startEvaluation"
      >
        开始造价评估
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      searchQuery: '',
      projects: [
        // 示例项目数据
        {
          id: 1,
          name: '项目一',
          status: '待评估',
          description: {
            text: '5ZWG5oiQ',
            image: ''
          }
        },
        {
          id: 2,
          name: '项目二',
          status: '已完成',
          description: {
            text: '6YeM5oiQ',
            image: ''
          }
        },
      ],
      filteredProjects: [] // 用于存储搜索结果
    };
  },
  mounted() {
    // 初始化为显示所有项目
    this.filteredProjects = this.projects;
  },
  methods: {
    decodeBase64Text(base64Text) {
      try {
        const binaryString = atob(base64Text); // 解码 Base64 为二进制字符串
        const utf8Text = decodeURIComponent(
          Array.from(binaryString)
            .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
            .join('')
        );
        return utf8Text;
      } catch (error) {
        console.error('解码失败：', error);
        return '无法显示内容';
      }
    },
    getStatusType(status) {
      if (status === '待评估') {
        return 'warning';
      } else if (status === '已完成') {
        return 'success';
      }
    },
    performSearch() {
      if (!this.searchQuery.trim()) {
        // 如果搜索词为空，显示所有项目
        this.filteredProjects = this.projects;
        return;
      }
      this.filteredProjects = this.projects.filter((project) => {
        const projectName = project.name.toLowerCase();
        const searchTerm = this.searchQuery.toLowerCase();
        const decodedDescription = this.decodeBase64Text(project.description.text).toLowerCase();
        return (
          projectName.includes(searchTerm) || decodedDescription.includes(searchTerm)
        );
      });
    },
    startEvaluation() {
      this.$router.push('/evaluation'); // 跳转到评估页面
    }
  },
};
</script>

<style scoped>
.main-container {
  padding: 24px;
  background: #f9f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 搜索框样式 */
.search-wrapper {
  width: 100%;
  max-width: 1200px;
  margin-bottom: 32px;
}

.search-input {
  width: 100%;
}

/* 卡片样式 */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1200px;
}

.project-card {
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.card-body {
  padding: 16px;
}

.card-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
}

.status-tag {
  font-size: 12px;
  padding: 0 8px;
}

/* 开始评估按钮样式 */
.action-section {
  margin-top: 32px;
  text-align: center;
}

.evaluate-button {
  width: 300px;
  height: 48px;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, #42a5f5, #1e88e5);
  color: white;
  border-radius: 8px;
  transition: all 0.3s;
}

.evaluate-button:hover {
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
