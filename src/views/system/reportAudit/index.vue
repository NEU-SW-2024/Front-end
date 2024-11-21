<template>
  <div style="padding:0 20px 0 20px">
    <div class="search-container">
      <div class="search-bar">
        <span class="label">名称</span>
        <el-input v-model="searchText" placeholder="请输入项目名称" class="input-style"/>
        <span class="label">状态</span>
        <el-select v-model="searchStatus" placeholder="请选择状态" class="input-style">
          <el-option label="全部" value=""></el-option>
          <el-option label="待计算" value='3'></el-option>
          <el-option label="待评估" value='0'></el-option>
          <el-option label="待审核" value='1'></el-option>
          <el-option label="完成" value='2'></el-option>
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button style="margin-left: 10px;" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 项目卡片展示 -->
    <div class="card-container">
      <el-card
          v-for="(project, index) in paginatedProjects"
          :key="index"
          class="card-item"
      >
        <div class="status-badge" :class="project.status === 1 ? 'status-unchecked' : 'status-checked'">
          {{ getStatusText(project.status) }}
        </div>
        <template #header>
          <div class="card-header">
            <span style="font-size: 18px; font-weight: bold;">{{ project.name }}</span>
          </div>
        </template>
        <div class="card-content">
          <div class="info-row">
            <p><strong>总造价:</strong> {{ project.total_cost }}</p>
          </div>
          <div class="info-row">
            <p><strong>项目创建时间：</strong> {{ project.create_time }}</p>
          </div>
          <div class="info-row">
            <p><strong>项目描述：</strong> {{ project.description }}</p>
          </div>
        </div>
        <div class="file-actions">
          <el-button @click="downloadFile(project.project_id)" type="primary" plain >下载文件</el-button>

        </div>
        <template #footer>
          <div class="card-footer">
            <div v-if="project.status === '1'" class="action-buttons">
              <el-button @click="openApproveDialog(project)" type="success" plain>批准</el-button>
              <el-button @click="rejectProject(project)"  type="danger" plain>驳回</el-button>
            </div>

          </div>
        </template>
      </el-card>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredProjects.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
      />
    </div>

    <div class="chart-card">
      <el-card class="chart-card-item">
        <div class="chart-container">
          <!-- 饼状图展示 -->
          <div id="pie-chart" style="width: 600px; height: 400px; margin: 0 auto;"></div>

          <!-- 折线图 -->
          <div id="line-chart" style="width: 600px; height: 400px; margin-left: 20px;"></div>
        </div>
      </el-card>
    </div>


    <el-dialog
        v-model="rejectDialogVisible"
        title="确认驳回"
        width="30%"
    >
      <p>确定要驳回该项目吗？</p>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRejection">确认</el-button>
      </template>
    </el-dialog>


    <el-dialog
        v-model="approveDialogVisible"
        title="确认操作"
        width="30%"
        :before-close="handleApproveDialogClose"
    >
      <p>确定批准？</p>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApprove">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from "echarts";
import {approveProject, rejectProject} from "@/api/system/reportAudit";
import {getTenantProjects} from "@/api/system/dataAnalysis";
import {saveAs} from "file-saver";
import axios from "axios";
import {generateDocx} from "@/utils/generateDocx";
import {renderAsync} from "docx-preview";


export default {
  data() {
    return {
      searchText: '',
      searchStatus: '',
      projects: [
        {
          "project_id": 1,
          "tenant_id": 1,
          "name": "若依管理系统",
          "description": "若依管理系啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊",
          "accessor": "若依haha",
          "auditor": "heihei",
          "project_status": null,
          "create_time": "2024-11-20 06:23:39",
          "features": [
            {
              "feat_name": "登录",
              "comment": "我要登陆"
            },
            {
              "feat_name": "注册",
              "comment": "我要注册"
            }
          ],
          "measures": [],
          "status": 1,
          "total_cost": 100000.0,
          "labor_cost": 70000.0,
          "risk_cost": 10000.0,
          "quality_cost": 5000.0,
          "dev_service_cost": 5000.0,
          "adjusted_dev_service_cost": 4500.0,
          "res_sugg": "建议优化人力资源配置，减少风险成本",
          "created_at": "2024-11-20 06:23:39",
          "report_status": true,
          "s": 4.0,
          "vaf": 3.0,
          "upf": 3,
          "dfp": 3.0,
          "gsc": 3
        },
        {
          "project_id": 2,
          "tenant_id": 1,
          "name": "若依代码生成",
          "description": "若依代码生成",
          "accessor": "heihei",
          "auditor": "若依haha",
          "project_status": null,
          "create_time": "2024-11-20 06:23:39",
          "features": [
            {
              "feat_name": "哈哈",
              "comment": "我要哈哈"
            }
          ],
          "measures": [],
          "status": 1,
          "total_cost": 80000.0,
          "labor_cost": 50000.0,
          "risk_cost": 8000.0,
          "quality_cost": 4000.0,
          "dev_service_cost": 6000.0,
          "adjusted_dev_service_cost": 5500.0,
          "res_sugg": "考虑增加团队培训以提升质量",
          "created_at": "2024-11-20 06:23:39",
          "report_status": true,
          "s": null,
          "vaf": null,
          "upf": 0,
          "dfp": null,
          "gsc": 0
        }
      ],
      filteredProjects: [],
      rejectDialogVisible: false,
      detailsDialogVisible: false,
      previewDialogVisible: false,
      currentProject: null,
      previewFileUrl: '',
      currentPage: 1,
      pageSize: 3,
      popoverVisible: null, // 控制哪个项目的弹出层显示
      approveDialogVisible: false// 控制批准对话框显示
    };
  },
  mounted() {
    this.fetchProjects();
  },
  computed: {
    paginatedProjects() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredProjects.slice(start, end);
    },
  },
  created() {
    this.filteredProjects = this.projects;
    this.$nextTick(() => {
      this.updateChart();
    });
  },
  methods: {
    // 获取项目数据
    async fetchProjects() {
      try {
        // 假设此接口可以返回所有项目列表
        const response = await getTenantProjects(); // 替换为实际接口
        this.projects = response;
        this.filteredProjects = this.projects;
        this.updateChart();
      } catch (error) {
        console.error("获取项目数据失败:", error);
        this.$message.error("获取项目数据时发生错误！");
      }
    },
    handleSearch() {
      this.filteredProjects = this.projects.filter((project) => {
        const matchesName = this.searchText ? project.name.includes(this.searchText) : true;
        const matchesStatus = this.searchStatus ? project.status === this.searchStatus : true;
        return matchesName && matchesStatus;
      });
      this.currentPage = 1;
      this.updateChart();
    },
    handleReset() {
      this.searchText = '';
      this.searchStatus = '';
      this.filteredProjects = this.projects;
      this.currentPage = 1;
      this.updateChart();
    },
    // 打开批准对话框
    openApproveDialog(project) {
      this.currentProject = project;
      this.approveDialogVisible = true;
    },

    // 关闭批准对话框
    handleApproveDialogClose() {
      this.approveDialogVisible = false;
    },

    // 确认批准（后端联调）
    async confirmApprove() {
      if (!this.currentProject) {
        this.$message.error('未选定项目！');
        return;
      }
      try {
        const response = await approveProject(this.currentProject.project_id); // 调用后端接口
        this.$message.success('项目批准成功！');
        await this.fetchProjects(); // 重新获取项目列表，确保数据实时更新
      } catch (error) {
        console.error('批准项目时发生错误:', error);
        this.$message.error('批准失败，请稍后再试！');
      } finally {
        this.approveDialogVisible = false; // 无论成功或失败，关闭对话框
      }
    },
    // 打开驳回对话框
    rejectProject(project) {
      this.currentProject = project;
      this.rejectDialogVisible = true;
    },

    // 确认驳回（后端联调）
    async confirmRejection() {
      if (!this.currentProject) {
        this.$message.error('未选定项目！');
        return;
      }
      try {
        const response = await rejectProject(this.currentProject.project_id);
        this.$message.success('项目已驳回！');
        await this.fetchProjects(); // 重新获取项目列表，刷新页面数据
      } catch (error) {
        console.error('驳回项目时发生错误:', error);
        this.$message.error('驳回失败，请稍后再试！');
      } finally {
        this.rejectDialogVisible = false; // 无论成功或失败，关闭对话框
      }
    },
    showDetails(project) {
      this.currentProject = project;
      this.detailsDialogVisible = true;
    },
    // 下载文件的方法
    async downloadFile(projectId) {
      try {
        // 找到对应项目数据
        const project = this.projects.find((p) => p.project_id === projectId);
        if (!project) {
          this.$message.error("未找到对应项目数据");
          return;
        }
        if (project.status === '0' || project.status === '3') {
          this.$message.error("为待评估/待计算状态，不可下载文件");
          return;
        }

        // 获取模板文件
        const response = await axios.get("/report/template2.docx", {responseType: "arraybuffer"});
        const templateContent = new Uint8Array(response.data); // 模板内容

        const data = {
          project_id: project.project_id || "",
          tenant_id: project.tenant_id || "",
          name: project.name || "",
          accessor: project.accessor || "",
          auditor: project.auditor || "",
          project_status: project.project_status || "",
          create_time: project.create_time || "",
          features: project.features.map((feature) => ({
            feat_name: feature.feat_name || "",
            comment: feature.comment || "",
          })),
          measures: project.measures.map((measure) => ({
            measure_name: measure.measure_name || "",
            DI: measure.di || "",
          })),
          status: project.status === 0 ? "待评估" : project.status === 1 ? "待审核" : project.status === 2 ? "完成" : "待计算",
          total_cost: project.total_cost || "",
          labor_cost: project.labor_cost || "",
          risk_cost: project.risk_cost || "",
          quality_cost: project.quality_cost || "",
          dev_service_cost: project.dev_service_cost || "",
          adjusted_dev_service_cost: project.adjusted_dev_service_cost || "",
          created_at: project.created_at || "",
          s: project.s || "",
          vaf: project.vaf || "",
          upf: project.upf || "",
          dfp: project.dfp || "",
          gsc: project.gsc || "",
        };
        // 调用 generateDocx 方法
        const output = generateDocx(templateContent, data);

        // 保存文件
        saveAs(output, `${project.name}_项目文档.docx`);
        this.$message.success("文件已生成并下载");
      } catch (error) {
        console.error("文件生成失败:", error);
        this.$message.error("文件生成失败，请稍后再试！");
      }
    },


    handlePageChange(page) {
      this.currentPage = page;
    },
    togglePopover(projectId) {
      // 切换弹出层的显示状态
      this.popoverVisible = this.popoverVisible === projectId ? null : projectId;
    },

    getStatusText(status) {
      const statusMap = {
        0: "待评估",
        1: "待审核",
        2: "完成",
        3: "未计算"
      };
      return statusMap[status] || "未知状态"; // 默认返回未知状态
    },


    updateChart() {
      const reviewed = this.projects.filter((p) => p.status === '2').length;
      const unreviewed = this.projects.filter((p) => p.status === '1').length;
      const uncalculated = this.projects.filter((p) => p.status === '3').length;
      const unassessed = this.projects.filter((p) => p.status === '0').length;

      const chartDom = document.getElementById("pie-chart");
      if (!chartDom) return;
      const chart = echarts.init(chartDom);
      chart.setOption({
        title: {
          text: "项目状态分布",
          subtext: `总计项目数：${this.projects.length}`,
          left: "center",
        },
        tooltip: {
          trigger: "item",
        },
        series: [
          {
            name: "项目状态",
            type: "pie",
            center: ["50%", "55%"], // 将饼状图垂直位置向下移动
            data: [
              {value: reviewed, name: "完成"},
              {value: unreviewed, name: "待审核"},
              {value: uncalculated, name: "待计算"},
              {value: unassessed, name: "待评估"},
            ],

            itemStyle: {
              normal: {
                color: (params) => {
                  // 自定义颜色数组
                  const colors = ["#7fd5fb", "#91affe", "#1E90FF", "#6495ED"];
                  return colors[params.dataIndex]; // 根据数据索引选择颜色
                },
              },
            },
          },
        ],
      });

      // 更新折线图
      const lineChartDom = document.getElementById("line-chart");
      if (!lineChartDom) return;

      const lineChart = echarts.init(lineChartDom);

      // 数据键和显示名称
      const costMetrics = [
        {key: "total_cost", name: "总造价"},
        {key: "labor_cost", name: "人工成本"},
        {key: "risk_cost", name: "风险成本"},
        {key: "quality_cost", name: "质量成本"},
        {key: "dev_service_cost", name: "开发服务费用"},
        {key: "adjusted_dev_service_cost", name: "调整后开发费用"},
      ];

      // x 轴显示这些指标的名称
      const xAxisData = costMetrics.map((metric) => metric.name);

      // 构造每个项目的折线图数据
      const seriesData = this.projects.map((project) => ({
        name: project.name,
        type: "line",
        data: costMetrics.map((metric) => project[metric.key] || 0), // 取出每个项目的相应值
      }));

      lineChart.setOption({
        title: {
          text: "项目成本趋势",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          top: "bottom",
          data: this.projects.map((project) => project.name),

        },
        xAxis: {
          type: "category",
          data: xAxisData,
          axisLabel: {
            rotate: 30, // 旋转 30 度
            interval: 0, // 强制显示所有标签
          },
        },
        yAxis: {
          type: "value",
        },
        grid: {
          top: "20%", // 设置距离顶部的距离
          left: "10%", // 设置距离左侧的距离
          right: "10%", // 设置距离右侧的距离
          bottom: "20%", // 设置距离底部的距离
        },
        series: seriesData,
      });
    },
  }

}
;
</script>


<style scoped>
/* 搜索栏容器 */
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
}

.label {
  margin-right: 10px;
  font-size: 16px;
  color: #0d47a1; /* 深蓝文字 */
}

.input-style {
  width: 550px;
  margin-right: 20px;
  border-radius: 5px;
}

.el-input__inner {
  background-color: #bbdefb; /* 浅蓝背景 */
  border-color: #42a5f5; /* 蓝色边框 */
}

.el-select {
  border-radius: 5px;
}

.el-select .el-input__inner {
  background-color: #bbdefb; /* 浅蓝背景 */
  border-color: #42a5f5;
}

/* 搜索按钮 */
.el-button--primary {
  background-color: #409eff; /* 蓝色按钮背景 */
  border-color: #409eff;
  color: white;
  border-radius: 5px;
}

.el-button--primary:hover {
  background-color: #409eff; /* 深蓝色悬停效果 */
  border-color: #409eff;
}

/* 卡片容器 */
.card-container {
  max-width: 1400px; /* 设置容器最大宽度 */
  margin: 0 auto; /* 居中 */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

/* 单个卡片 */
.card-item {
  position: relative;
  width: 450px;
  height: 300px;
  box-sizing: border-box;
  border: 1px solid #f5f5f7;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.card-item:hover {
  transform: scale(1.02); /* 悬停放大效果 */
}

/* 状态徽章 */
.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.status-unchecked {
  background-color: #91affe; /* 紫色未审核 */
}

.status-checked {
  background-color: #409eff; /* 蓝色已审核 */
}

/* 卡片头部 */
.card-header {
  font-weight: bold;
  font-size: 16px;
  color: #0d47a1; /* 深蓝标题 */
  margin-bottom: 10px;
}

/* 文件操作按钮居中 */
.file-actions {
  display: flex;
  justify-content: center; /* 居中对齐 */
  gap: 20px; /* 按钮之间的间隙 */
  margin-top: 15px;
}

.download-button,
.preview-button {
  background-color: #7fd5fb;
  color: white;
  border: none;
  padding: 8px 15px; /* 增加按钮尺寸 */
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.download-button:hover,
.preview-button:hover {
  background-color: #2196f3;
}

/* 审核操作按钮 */
.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.approve-button {
  background-color: #7fd5fb; /* 蓝色批准 */
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: -10px; /* 向上移动 */
}

.approve-button:hover {
  background-color: #54c1f9;
}

.details-button {
  background-color: #42a5f5; /* 蓝色详情 */
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: -10px; /* 向上移动 */

}

.details-button:hover {
  background-color: #2196f3;
}

/* 审核结果内容居中 */
.card-footer {
  display: flex;
  justify-content: center; /* 居中 */
  align-items: center;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #0d47a1; /* 深蓝字体 */
}

/* 分页容器 */
.pagination-container {
  margin-top: -5px; /* 调整分页与卡片之间的间距 */
  display: flex;
  justify-content: center; /* 保持分页居中 */
  margin-right: 20px; /* 向左移动 */
}

.el-pagination .el-pager li.active {
  background-color: #42a5f5;
  border-color: #42a5f5;
  color: white;
}

/* 弹窗样式 */
.el-dialog__header {
  background-color: #42a5f5; /* 蓝色弹窗标题背景 */
  color: white; /* 标题文字白色 */
}

.el-dialog {
  border-radius: 10px;
}

.card-content {
  text-align: left; /* 左对齐 */
  display: flex; /* 使用 Flex 布局 */
  flex-direction: column; /* 垂直排列 */
  gap: 10px; /* 子元素之间的间距 */
}

.info-row {
  display: flex; /* 每行使用 Flex 布局 */
  justify-content: flex-start; /* 左对齐 */
  align-items: center; /* 垂直居中 */
  gap: 20px; /* 每列之间的间距 */
}

.info-row p {
  margin: 0; /* 去掉段落默认外边距 */
  padding: 0; /* 去掉内边距 */
  line-height: 1.6; /* 设置统一行高 */
  font-size: 14px; /* 统一字体大小 */
}

/* 搜索栏容器 */
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 10px;

}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #e3f2fd;
  padding: 15px;
  border-radius: 10px;
  width: 100%; /* 让搜索栏占满容器宽度 */
  max-width: 1400px; /* 设置搜索栏的最大宽度 */
}

#pie-chart {
  flex: 1;
}

#line-chart {
  flex: 1;
}

.chart-container {
  display: flex;
  justify-content: space-between; /* 两图左右分布 */
  align-items: center; /* 垂直居中 */
  width: 100%; /* 容器宽度 */
  max-width: 1200px; /* 最大宽度 */
  margin: 0 auto; /* 居中 */

}

.chart-item {
  width: 48%; /* 每个图表占容器宽度的 48% */
  height: 400px; /* 固定高度 */
}

/* 大卡片容器样式 */
.chart-card {
  display: flex;
  justify-content: center; /* 居中对齐 */
  margin-bottom: 20px; /* 与下面卡片的间距 */
  border-radius: 20px;
  margin-top: 25px; /* 调整分页与卡片之间的间距 */
}

/* 大卡片样式 */
.chart-card-item {
  width: 1400px; /* 最大宽度，与下方卡片对齐 */
  padding: 20px;
  box-sizing: border-box;
}

/* 功能点信息文字 */
.info-text {
  cursor: pointer;
  font-size: 14px;
  color: #42a5f5; /* 蓝色文字 */
  margin-right: 5px; /* 与小三角的间距 */
  display: inline-block;
  transition: color 0.2s ease;
}

.info-text:hover {
  color: #2196f3; /* 鼠标悬停效果 */
}

/* 小三角图标 */
.triangle-icon {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #42a5f5; /* 蓝色三角 */
  cursor: pointer;
  transition: transform 0.2s ease;
}

.triangle-icon:hover {
  transform: scale(1.1); /* 鼠标悬停放大效果 */
}

/* 弹出内容样式 */
.popover-content {
  position: absolute;
  top: 12px; /* 调整弹出层位置 */
  left: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  padding: 10px;
  width: 200px; /* 设置弹出层宽度 */
  z-index: 10; /* 确保弹出层在最上层 */
  font-size: 14px;
  line-height: 1.6;
}

.popover-content p {
  margin: 5px 0;
}

/* 小三角容器 */
.triangle-container {
  position: relative;
  margin-top: 5px; /* 与审核员的间距 */
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 5px; /* 功能点信息和小三角之间的间距 */
}

.revoke-button {
  background-color: #f1948a; /* 红色撤回按钮 */
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: -5px; /* 向上移动 10px */
}

.revoke-button:hover {
  background-color: #e53935; /* 深红色悬停效果 */
}

#docx-container {
  width: 100%;
  height: 500px;
  margin: 20px auto;
  border: 1px solid #ccc;
  overflow: auto;
}


</style>
