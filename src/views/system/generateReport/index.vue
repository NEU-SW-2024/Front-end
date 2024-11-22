<template>
  <div class="project-container">
    <el-row :gutter="20">
      <el-col :span="8" v-for="project in projects" :key="project.project_id">
        <el-card class="project-card" shadow="hover">
          <template v-slot:header>
            <div class="header">
              <span class="project-type">{{ project.type }}</span>
              <span class="project-title">{{ project.name }}</span>
            </div>
          </template>
          <div class="project-details">
            <div class="amount">
              <span class="amount-label">评估金额</span>
              <div class="amount-value-container">
                <span class="amount-value">{{ project.total_cost }}</span>
                <span class="amount-unit">万元</span>
              </div>
            </div>
            <div class="status">
              <span :class="['status-dot', project.report_status === '已生成报告' ? 'status-completed' : 'status-pending']"></span>
              <span class="status-text">{{ project.report_status }}</span>
            </div>
            <p class="info">时间: {{ project.creat_time }}</p>
          </div>
          <div class="project-action">
            <button @click="generateReport(project)">生成评估文档</button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
        v-model="dialogVisible"
        title="提示"
        width="30%"
        :close-on-click-modal="false"
    >
      <p>此项目未生成报告，是否生成评估文档？</p>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmGenerateReport">确定</el-button>
      </template>
    </el-dialog>

    <div class="charts-container">
      <div class="chart-container">
        <h3>评估任务分布</h3>
        <div id="pieChart" class="pie-chart"></div>
      </div>
      <div class="chart-container">
        <h3>任务完成量</h3>
        <TaskHeatmap :values="taskCompletionData" :startDate="startDate" :endDate="endDate" />
      </div>
    </div>
  </div>
</template>

<script>
import TaskHeatmap from "./TaskHeatmap.vue";
import * as echarts from "echarts";
import axios from "axios"; // 引入 axios 库
import { saveAs } from "file-saver"; // 引入 file-saver 用于文件下载
import { generateDocx } from "@/utils/generateDocx.js"; // 引入自定义的文档生成工具
import {getTenantProjects,generateReports} from "@/api/system/dataAnalysis";

export default {
  components: {
    TaskHeatmap,
  },
  data() {
    return {
      projects: [], // 从后端动态加载数据
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
      taskCompletionData: {},
      completedCount: 0,
      pendingCount: 0,
      dialogVisible: false,
      selectedProject: null,
    };
  },
  mounted() {
    this.fetchProjects();

  },
  methods: {
    // 从后端获取项目数据
    async fetchProjects() {
      try {
        const response = await getTenantProjects();
        this.projects = response.map((project) => ({
          ...project,
          project_id: project.project_id,
          type: "项目",
          name: project.name,
          total_cost: project.total_cost,
          report_status: project.report_status === false ? "未生成报告" : "已生成报告",
          creat_time: project.create_time,
        }));
        console.log(this.projects);
        // 更新统计信息
        this.completedCount = this.projects.filter((p) => p.report_status === "已生成报告").length;
        this.pendingCount = this.projects.filter((p) => p.report_status === "未生成报告").length;
        this.createPieChart();
      } catch (error) {
        console.error("获取项目数据失败:", error);
        this.$message.error("加载项目数据失败，请稍后重试。");
      }
    },

    // 创建饼状图
    createPieChart() {
      const chartDom = document.getElementById("pieChart");
      const myChart = echarts.init(chartDom);

      const option = {
        backgroundColor: "#fff",
        tooltip: {
          trigger: "item",
        },
        series: [
          {
            name: "任务状态",
            type: "pie",
            radius: ["40%", "70%"],
            center: ["50%", "50%"],
            roseType: "radius",
            data: [
              {value: this.completedCount, name: "已生成报告"},
              {value: this.pendingCount, name: "未生成报告"},
            ],
            itemStyle: {
              color: (params) => {
                const colors = ["#5cc25f", "#a6e7a6"];
                return colors[params.dataIndex % colors.length];
              },
              shadowBlur: 15,
              shadowOffsetX: 5,
              shadowOffsetY: 5,
              shadowColor: "rgba(0, 0, 0, 0.3)",
            },
            label: {
              show: true,
              fontSize: 14,
              formatter: "{b}",
            },
            labelLine: {
              length: 20,
              length2: 30,
              smooth: true,
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 25,
                shadowColor: "rgba(0, 0, 0, 0.6)",
                borderWidth: 2,
                borderColor: "#ffffff",
              },
            },
          },
        ],
      };

      myChart.setOption(option);
    },

    // 生成评估文档
    async downloadFile(projectId) {
      try {
        // 找到对应项目数据
        const project = this.projects.find((p) => p.project_id === projectId);
        if (!project) {
          this.$message.error("未找到对应项目数据");
          return;
        }
        if(project.status === '0' || project.status ==='3'){
          this.$message.error("为待评估/待计算状态，不可生成报告");
          return;
        }

        // 获取模板文件
        const response = await axios.get("/report/template2.docx", {responseType: "arraybuffer"});
        const templateContent = new Uint8Array(response.data); // 模板内容

        const data = {
          project_id: project.project_id,
          tenant_id: project.tenant_id,
          name: project.name,
          accessor: project.accessor,
          auditor: project.auditor,
          project_status: project.project_status,
          create_time: project.create_time,
          features: project.features.map((feature) => ({
            feat_name: feature.feat_name,
            comment: feature.comment,
          })),
          measures: project.measures.map((measure) => ({
            measure_name: measure.measure_name,
            DI: measure.di,
          })),
          status: project.status === "0" ? "待评估" : project.status ==="1" ? "待审核" : project.status === "2" ? "完成" : "待计算",
          total_cost: project.total_cost,
          labor_cost: project.labor_cost,
          risk_cost: project.risk_cost,
          quality_cost: project.quality_cost,
          dev_service_cost: project.dev_service_cost,
          adjusted_dev_service_cost: project.adjusted_dev_service_cost,
          created_at: project.created_at,
          s: project.s,
          vaf: project.vaf,
          upf: project.upf ,
          dfp: project.dfp,
          gsc: project.gsc,
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


    // 触发生成文档确认框
    generateReport(project) {
      if(project.status === '0' || project.status ==='3'){
        this.$message.error("为待评估/待计算状态，不可生成报告，请先完成评估");
        return;
      }
      if (project.report_status === "已生成报告") {
        this.$message({
          message: "报告已生成，无需重复生成。",
          type: "info",
        });
      } else {
        this.dialogVisible = true;
        this.selectedProject = project;
      }
    },

    // 确认生成文档
    async confirmGenerateReport() {
      if (this.selectedProject) {
        await generateReports(this.selectedProject.project_id);
        await this.downloadFile(this.selectedProject.project_id);
      }
      await this.fetchProjects();
      this.dialogVisible = false;
    },
  },
};
</script>

<style scoped>
.project-container {
  padding: 20px;
}

.project-card {
  border-radius: 8px;
  overflow: hidden;
  padding: 20px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  border: 1px solid #ddd; /* 添加边框 */
}


.header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.project-type {
  font-size: 12px;
  color: #409EFF;
  background-color: #E0F3FF;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 10px;
}

.project-title {
  font-size: 16px;
  font-weight: bold;
}

.project-details {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.amount {
  margin: 10px 0 20px;
}

.amount-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
  display: block;
}

.amount-value-container {
  display: flex;
  align-items: baseline;
}

.amount-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-right: 5px;
}

.amount-unit {
  font-size: 14px;
  color: #909399;
}

.status {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 16px;
  margin-bottom: 10px;
}

.status-text {
  font-size: 16px;
  color: #333;
  margin-right: 5px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-completed {
  background-color: #67c23a; /* 绿色圆点表示评估完成 */
}

.status-pending {
  background-color: #f56c6c; /* 红色圆点表示未评估 */
}

.info {
  color: #909399;
  margin: 5px 0;
}

.project-action {
  margin-top: 10px;
  text-align: right;
}

.project-action a {
  color: #409EFF;
  text-decoration: none;
}

.project-action a:hover {
  text-decoration: underline;
}

.project-container {
  padding: 20px;
}

.charts-container {
  display: flex;
  justify-content: space-between;
  align-items: stretch; /* 确保两个图表上下对齐 */
  margin-top: 20px;
  gap: 20px;
}

.chart-container {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  width: 48%; /* 每个图表占一半宽度 */
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 确保内容在容器内平均分布 */
}

.pie-chart {
  width: 100%;
  height: 300px;
}

.task-heatmap {
  width: 100%;
  height: 300px; /* 确保与饼状图一致 */
}

.project-action button {
  margin-top: 10px;
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  background-color: #409EFF;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.project-action button:hover {
  background-color: #66b1ff;
}

</style>
