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
          <el-button @click="performSearch">搜索</el-button>
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
            <h3>{{ project.name }}</h3>
            <el-tag   
              class="status-tag"
              :type="getStatusType(projectStatuses[project.projectId])">
              {{ projectStatuses[project.projectId] || '加载中...' }}
            </el-tag>
          </div>
          
          <!-- 卡片主体区 -->
          <div class="card-body">
            <p class="card-description">{{ project.description}}</p>
          </div>

          <!-- 卡片底部按钮 -->
          <div class="card-footer">
            <el-button 
              :type="projectStatuses[project.projectId] === '待评估' ? 'primary' : 'success'"
              @click="handleButtonClick(project)">
              {{ projectStatuses[project.projectId] === '待评估' ? '去评估' : '查看结果' }}
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>
  
  
  <script lang="ts">
  import request from '@/utils/request'
  export default {
    data() {
      return {
        searchQuery: '',
        projects: [],
        filteredProjects: [], // 用于存储搜索结果
        projectStatuses: {} // 新增：用于存储项目状态
      };
    },
    mounted() {
      // 初始化为显示所有项目
      this.getProjects();
      this.filteredProjects = this.projects;
    },
    methods: {
      async getProjectStatus(projectId) {
        const response = await request({
          url: '/dev-api/accessor/getStatus',
          method: 'get',
          params: { projectId }
        })  
        if (response.code === 200) {
          // 修改这里，直接用数字比较
      switch(Number(response.data)) {  // 确保是数字类型
        case 0:
          return '待评估';
        case 1:
          return '待审核';
        case 2:
          return '已完成';
        default:
            return '未知';
          }
        }
      },
      getStatusType(status) {
      const statusMap = {
        '待评估': 'info',
        '待审核': 'warning',
        '已完成': 'success',
      };
      return statusMap[status] || 'info';
    },
      async getProjects() {
      try {
        const response = await request({
          url: '/dev-api/accessor/getProjects',
          method: 'get',
          params: {
            accessorId: 2
          }
        });
        
        if (response.code === 200) {
          this.projects = response.data;
          this.filteredProjects = this.projects;
          // 获取所有项目的状态
          await Promise.all(
            this.projects.map(async (project) => {
              this.projectStatuses[project.projectId] = await this.getProjectStatus(project.projectId);
            })
          );
          console.log(this.projectStatuses);
        } else {
          this.$message.error(response.msg || '获取项目列表失败');
        }
      } catch (error) {
        console.error('获取项目列表出错：', error);
        this.$message.error('获取项目列表失败，请稍后重试');
      }
    },
      getStatusType(status: string) {
        if (status === '待评估') {
          return 'warning';
        } else if (status === '待审查') {
          return 'info';
        } else if (status === '已完成') {
          return 'success';
        }
      },
      performSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredProjects = this.projects;
        return;
      }

      this.filteredProjects = this.projects.filter(project => {
        const projectName = project.name.toLowerCase();
        const searchTerm = this.searchQuery.toLowerCase();
        const description = project.description.toLowerCase();
        
        return projectName.includes(searchTerm) || 
               description.includes(searchTerm);
      });
    },
      handleButtonClick(project) {
      if (this.projectStatuses[project.projectId] === '待评估') {
        // 跳转到评估页面
        this.$router.push({
  path: '/accessor2',
  query: { projectId: project.projectId.toString() }
});
      } else {
        // 跳转到结果查看页面
        this.$router.push({
          path: '/accessor3',
          query: { projectId: project.projectId.toString() }
        })
      }
    },
    },
  };
</script>

<style scoped>
.main-container {
  padding: 24px;
  min-height: calc(100vh - 60px);
  max-width: 1400px;  /* 添加最大宽度 */
  margin: 0 auto;     /* 居中容器 */
}

.search-wrapper {
  max-width: 800px;
  margin: 0 auto 32px;
  padding: 0 16px;
}

.search-input {
  width: 100%;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 0 16px;
}

.project-card {
  width: 300px; /* 修改这行：设置固定宽度 */
  height: 300px; /* 添加这行：设置固定高度 */
  transition: all 0.3s ease;
  position: relative;  /* 添加这行，作为定位上下文 */
  padding-bottom: 60px;  /* 为底部按钮预留空间 */
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

/* 确保卡片内容不会被底部按钮遮挡 */
.card-body {
  flex: 1;
  margin-bottom: 16px;
  overflow: hidden;  /* 防止内容溢出 */
}
.card-description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
}

.card-image {
  width: 40%;
  max-height: 160px;
  object-fit: cover;
  border-radius: 4px;
}

.card-footer {
  position: absolute;  /* 改为absolute定位 */
  bottom: 20px;       /* 距离底部20px */
  right: 20px;        /* 距离右侧20px */
  width: auto;        /* 移除固定宽度 */
  background-color: #fff;  /* 确保按钮背景是白色 */
}


.status-tag {
  font-size: 12px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
}

/* 响应式调整 */
@media screen and (max-width: 1440px) {
  .main-container {
    max-width: 1200px;
  }
}

@media screen and (max-width: 1200px) {
  .main-container {
    max-width: 900px;
  }
}

@media screen and (max-width: 768px) {
  .main-container {
    padding: 16px;
    max-width: 100%;
  }
  
  .card-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>