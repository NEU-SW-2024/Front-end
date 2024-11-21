<template>
  <div class="dashboard">
    <el-row gutter="20">
      <!-- 任务分配情况 -->
      <el-col :span="12">
        <el-card>
          <div slot="header"
               style="display: flex; justify-content: space-between; align-items: center; height: 50px;position: relative; ">
            <div class="custom-tag">
              <span>任务分配情况</span>
            </div>
            <div>
              <el-radio-group v-model="showaccessor" @change="updateTaskChart">
                <el-radio-button v-model="showaccessor" label="评估师">评估师</el-radio-button>
                <el-radio-button v-model="showaccessor" label="审核员">审核员</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div id="task-chart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 各项目造价评估结果 -->
      <el-col :span="12">
        <el-card>
          <div slot="header" style="display: flex; justify-content: space-between; align-items: center; height: 50px">
            <div class="custom-tag">
              <span>各项目造价评估结果</span>
            </div>
          </div>
          <div id="cost-evaluation-chart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row gutter="20" style="margin-top: 20px;">
      <!-- 历史数据趋势分析 -->
      <el-col :span="24">
        <el-card>
          <div class="custom-tag">
            <div slot="header">历史数据趋势分析</div>
          </div>
          <div id="trend-chart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <div class="custom-tag">
        <div slot="header">项目列表</div>
      </div>
      <el-table :data="projects" border style="width: 100%" stripe>
        <el-table-column prop="project_id" label="序号" width="80"></el-table-column>
        <el-table-column prop="name" label="项目名称"></el-table-column>
        <el-table-column prop="project_createdTime" label="创建日期"></el-table-column>
        <el-table-column prop="evaluate_result" label="造价结果"></el-table-column>
        <!-- 状态列 -->
        <el-table-column label="评估状态" width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center;">
              <!-- 进度条 -->
              <el-progress
                  v-if="scope.row.status === 0"
                  :percentage="25"
                  :show-text="false"
                  status="warning"
                  style="flex-grow: 1; margin-right: 10px; height: 8px;"
              ></el-progress>
              <el-progress
                  v-if="scope.row.status === 1"
                  :percentage="60"
                  :show-text="false"
                  style="flex-grow: 1; margin-right: 10px; height: 8px;"
              ></el-progress>
              <el-progress
                  v-if="scope.row.status === 2"
                  :percentage="100"
                  :show-text="false"
                  status="success"
                  style="flex-grow: 1; margin-right: 22px; height: 8px;"
              ></el-progress>

              <!-- 状态文字 -->
              <span v-if="scope.row.status === 0" class="el-tag el-tag--warning el-tag--mini">
        待评估
      </span>
              <span v-if="scope.row.status === 1" class="el-tag el-tag--primary el-tag--mini">
        待审核
      </span>
              <span v-if="scope.row.status === 2" class="el-tag el-tag--success el-tag--mini">
         完成
      </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="accessor" label="评估师"></el-table-column>
        <el-table-column prop="auditor" label="审核员"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="generateFile(scope.row.project_id)"
                style="border: none; color: #409EFF; padding: 0; background-color: transparent; box-shadow: none;"
            >
              <el-icon style="margin-right: 4px">
                <View/>
              </el-icon>
              查看报告
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <button @click="fetchProjects()"/>
  </div>

  <el-dialog
      v-model="dialogVisible"
      style="border-radius: 8px"
      title="报告预览"
      width="80%"
      append-to-body
      @opened="previewWord"> <!-- 使用 @opened 确保内容已渲染后执行 -->

    <div id="docx-container" style="max-height: 580px; overflow: auto;"></div>
    <div style="text-align: right; margin-top: 10px">
      <el-button type="success" @click="download()">
        <el-icon>
          <Download/>
        </el-icon>
        下载文档
      </el-button>
    </div>


  </el-dialog>

</template>

<script>
import * as echarts from "echarts";
import {Download, View} from "@element-plus/icons-vue";
import {renderAsync} from "docx-preview";
import {getTenantProjects} from "@/api/system/dataAnalysis";
import axios from "axios";
import {generateDocx} from "@/utils/generateDocx.js"; // 导入 API

export default {
  components: {Download, View},
  data() {
    return {
      showaccessor: "评估师", // 默认显示评估师分配情况
      dialogVisible: false, // 控制弹窗是否显示
      currentFileUrl: "/ccc.docx", // 文档路径（当前为测试路径，改为null）
      currentProjectId: null, // 当前选中的项目ID
      currentFileName: " ",  // 当前文件名（项目名称+.docx）
      projects: [
        {
          //第一组数据
          project_id: 1,
          name: "项目A",
          project_createdTime: "2024-01-10",
          accessor: "张三",
          auditor: "李四",
          feats: [
            {
              feat_name: "输入信息",
              feat_descr: "输入所需要的信息",
            },
            {
              feat_name: "输出结果",
              feat_descr: "输出所需的结果",
            },
            {
              feat_name: "数据处理",
              feat_descr: "处理数据",
            }
          ],
          UPF: 120,  //功能点分数总和
          adj_arg: 80,  //调整系数
          AFP: 300,  //调整后的功能点分数总和
          GSC_total: 90,  //GSC总和
          status: "0",  //项目状态（0：待评估，1：待审核，2：完成）
          evaluate_result: "￥30,000",
        },
        {
          //第二组数据
          project_id: 2,
          name: "项目B",
          project_createdTime: "2024-01-12",
          accessor: "李四",
          auditor: "王五",
          feats: [
            {
              feat_name: "输入信息",
              feat_descr: "输入所需要的信息",
            },
            {
              feat_name: "输出结果",
              feat_descr: "输出所需的结果",
            }
          ],
          UPF: 130,  //功能点分数总和
          adj_arg: 90,  //调整系数
          AFP: 350,  //调整后的功能点分数总额和
          GSC_total: 100,  //GSC总和
          status: "1",  //项目状态（0：待评估，1：待审核，2：完成）
          evaluate_result: "￥25,000",
        },
        {
          //第一组数据
          project_id: 3,
          name: "项目C",
          project_createdTime: "2022-01-10",
          accessor: "张三",
          auditor: "李四",
          feats: [
            {
              feat_name: "输入信息",
              feat_descr: "输入所需要的信息",
            },
            {
              feat_name: "输出结果",
              feat_descr: "输出所需的结果",
            },
            {
              feat_name: "数据处理",
              feat_descr: "处理数据",
            }
          ],
          UPF: 120,  //功能点分数总和
          adj_arg: 80,  //调整系数
          AFP: 300,  //调整后的功能点分数总和
          GSC_total: 90,  //GSC总和
          status: "2",  //项目状态（0：待评估，1：待审核，2：完成）
          evaluate_result: "￥30,000",
        },
        {
          //第一组数据
          project_id: 4,
          name: "项目D",
          project_createdTime: "2023-01-10",
          accessor: "张三",
          auditor: "李四",
          feats: [
            {
              feat_name: "输入信息",
              feat_descr: "输入所需要的信息",
            },
            {
              feat_name: "输出结果",
              feat_descr: "输出所需的结果",
            },
            {
              feat_name: "数据处理",
              feat_descr: "处理数据",
            }
          ],
          UPF: 120,  //功能点分数总和
          adj_arg: 80,  //调整系数
          AFP: 300,  //调整后的功能点分数总和
          GSC_total: 90,  //GSC总和
          status: "1",  //项目状态（0：待评估，1：待审核，2：完成）
          evaluate_result: "￥30000",
        },
      ],
    };
  },
  mounted() {
    this.fetchProjects();
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await getTenantProjects(); // 调用 API 获取项目数据
        for (let val of response) {
          val.evaluate_result = `￥${val.total_cost}`
          val.project_createdTime = new Date(val.create_time).toLocaleDateString()
          val.status = parseInt(val.status) || 0
        }
        this.projects = response
        this.initCharts();

        console.log(this.projects)
      } catch (error) {
        console.error("获取项目列表失败：", error);
      }
    },

    //下载文件
    async generateFile(projectId) {
      try {
        const project = this.projects.find((p) => p.project_id === projectId);
        if (!project) {
          this.$message.error("未找到对应项目数据");
          return;
        }

        const response = await axios.get("/report/template2.docx", {responseType: "arraybuffer"});
        const content = new Uint8Array(response.data);

        const data = {
          project_id: project.project_id || "",
          tenant_id: project.tenant_id || "",
          name: project.name || "",
          description: project.description || "",
          accessor_id: project.accessor_id || "",
          auditor_id: project.auditor_id || "",
          project_status: project.project_status || "",
          create_time: project.create_time || "",
          features: project.features || [],
          measures: project.measures || [],
          total_cost: project.total_cost || "",
          labor_cost: project.labor_cost || "",
          risk_cost: project.risk_cost || "",
          quality_cost: project.quality_cost || "",
          dev_service_cost: project.dev_service_cost || "",
          adjusted_dev_service_cost: project.adjusted_dev_service_cost || "",
          res_sugg: project.res_sugg || "",
          created_at: project.created_at || "",
        };

        const output = generateDocx(content, data);
        const url = URL.createObjectURL(output);
        window.currentPreview = {
          url,
          name: `${project.name}_项目文档.docx`,
        };

        this.$message.success("文件已生成");
        this.dialogVisible = true;
      } catch (error) {
        console.error("文件生成失败:", error);
        this.$message.error("文件生成失败，请稍后再试！");
      }
    },

    async previewWord() {
      const container = document.getElementById("docx-container");
      if (!container) {
        console.error("docx-container 未找到！");
        return;
      }
      container.innerHTML = ""; // 清空之前的内容

      try {
        const response = await fetch(window.currentPreview.url); // 获取文档内容
        const blob = await response.blob(); // 获取文档 Blob
        await renderAsync(blob, container); // 使用 docx-preview 渲染文档
      } catch (error) {
        console.error("预览文档失败：", error);
        container.innerHTML = "<p>文档加载失败，请重试。</p>";
      }
    },

    //下载文件
    download() {
      const link = document.createElement("a");
      link.href = window.currentPreview.url;
      link.download = window.currentPreview.name;
      link.click();
    },


    initCharts() {
      this.updateTaskChart();
      this.updateCostEvaluationChart();
      this.updateTrendChart();
    },
    updateTaskChart() {
      const taskChart = echarts.init(document.getElementById("task-chart"));
      const role = this.showaccessor === "评估师" ? "accessor" : "auditor";
      const categories = [...new Set(this.projects.map((p) => p[role]))];

      const completedTasks = categories.map((name) => {
        return this.projects.filter((p) => {
          if (role === "accessor") {
            return p[role] === name && (p.status === 1 || p.status === 2);
          } else {
            return p[role] === name && p.status === 2;
          }
        }).length;
      });

      const pendingTasks = categories.map((name) => {
        return this.projects.filter((p) => {
          if (role === "accessor") {
            return p[role] === name && p.status === 0;
          } else {
            return p[role] === name && (p.status === 1 || p.status === 0);
          }
        }).length;
      });

      const gradient1 = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {offset: 0, color: '#84dbf6'},
        {offset: 1, color: '#649feb'}
      ]);
      const gradient2 = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {offset: 0, color: '#FF7A00'},
        {offset: 1, color: '#ffbfa2'}
      ]);

      taskChart.setOption({
        title: {
          text: this.showaccessor ? "评估师任务情况" : "审核员任务情况",
          left: "center",
          //top: "5%" // 增加标题的上边距
        },
        tooltip: {trigger: "axis"},
        legend: {
          data: ["完成任务", "未完成任务"],
          top: "10%", // 图例距离顶部的距离，增加间距
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%', // 增加图表顶部的空隙
          containLabel: true
        },
        xAxis: {type: "value"},
        yAxis: {type: "category", data: categories},
        series: [
          {
            name: "完成任务",
            type: "bar",
            data: completedTasks,
            itemStyle: {color: gradient1},
            barWidth: 30,
          },
          {
            name: "未完成任务",
            type: "bar",
            data: pendingTasks,
            barWidth: 30,
            itemStyle: {color: gradient2}
          }
        ],
      });
    },
    updateCostEvaluationChart() {
      const costChart = echarts.init(document.getElementById("cost-evaluation-chart"));
      const names = this.projects.map((p) => p.name); // 项目名称
      const points = this.projects.map((p) => p.features.length); // 功能点数（feats 的长度）
      const costs = this.projects.map((p) => parseInt(p.evaluate_result.replace(/[^\d]/g, ""))); // 造价价格（提取数字）

      // 渐变色设置，保持与第一个图表一致
      const gradient1 = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        {offset: 0, color: '#84dbf6'},
        {offset: 1, color: '#649feb'}
      ]);
      const gradient2 = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        {offset: 0, color: '#FF7A00'},
        {offset: 1, color: '#f86ca3'}
      ]);

      costChart.setOption({
        title: {
          text: "造价评估结果",
          left: "center",
          textStyle: {
            fontSize: 20,
            fontWeight: "bold",
            color: "#333"
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {type: "cross"},
          backgroundColor: "rgba(0,0,0,0.7)", // 背景透明度
          textStyle: {color: "#fff"}, // 文字颜色为白色
          padding: [8, 12], // 内边距增加
          borderRadius: 4 // 边框圆角
        },
        legend: {
          data: ["功能点数", "造价价格 (¥)"],
          top: "8%",
          textStyle: {color: "#333", fontSize: 14}, // 图例字体颜色和大小
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
          top: '18%'// 增加图表顶部的空隙
        },
        xAxis: {
          type: "category",
          data: names,
          axisLabel: {
            interval: 0, // 确保所有标签都能显示
            rotate: 45, // 标签倾斜45度，避免重叠
            textStyle: {fontSize: 12, color: "#3b3b3b"}, // 坐标轴字体大小和颜色
          },
          axisLine: {
            lineStyle: {
              color: "#424242" // 黑色坐标轴线
            }
          },
          axisTick: {
            show: false // 去掉刻度线
          },
          splitLine: {
            show: false // 去掉分隔线
          }
        },
        yAxis: [
          {
            type: "value",
            name: "功能点数",
            position: "left",
            axisLabel: {formatter: "{value}"},
            axisLine: {
              lineStyle: {
                color: "#424242" // 黑色坐标轴线
              }
            },
            axisTick: {
              show: false // 去掉刻度线
            },
            splitLine: {
              lineStyle: {color: "#ddd", type: "dashed"} // 使用虚线做分隔线
            },
          },
          {
            type: "value",
            name: "造价价格 (¥)",
            position: "right",
            axisLabel: {formatter: "{value} ¥"},
            axisLine: {
              lineStyle: {
                color: "#424242", // 黑色坐标轴线
              }
            },
            axisTick: {
              show: false // 去掉刻度线
            },
            splitLine: {
              lineStyle: {color: "#ddd", type: "dashed"} // 使用虚线做分隔线
            },
          }
        ],
        series: [
          {
            name: "功能点数",
            type: "bar",
            yAxisIndex: 0,
            data: points,
            itemStyle: {
              color: gradient1, // 应用渐变色
            },
            barWidth: 30, // 调整柱子宽度，使得柱子更粗
          },
          {
            name: "造价价格 (¥)",
            type: "line",
            yAxisIndex: 1,
            data: costs,
            smooth: true, // 使折线平滑
            lineStyle: {color: "#ff8067", width: 3}, // 设置折线的颜色和宽度
            symbol: "circle", // 设置折线的节点样式
            symbolSize: 8, // 节点的大小
            itemStyle: {
              color: "#ffa18d", // 设置折线点的颜色
            },
          },
        ],
      });
    },
    updateTrendChart() {
      const trendChart = echarts.init(document.getElementById("trend-chart"));
      const currentYear = new Date().getFullYear();
      const years = Array.from({length: 5}, (_, i) => currentYear - 4 + i);

      const yearData = years.map((year) => {
        const projectsInYear = this.projects.filter(
            (p) => new Date(p.project_createdTime).getFullYear() === year
        );
        const projectCount = projectsInYear.length;
        const totalCost = projectsInYear.reduce(
            (acc, p) => acc + parseInt(p.evaluate_result.replace(/[^\d]/g, "")), 0
        );
        const averageCost = projectCount > 0 ? totalCost / projectCount : 0;
        return {year, projectCount, averageCost};
      });

      const projectCounts = yearData.map((data) => data.projectCount);
      const averageCosts = yearData.map((data) => data.averageCost);

      trendChart.setOption({
        title: {
          text: "历史数据趋势分析",
          left: "center",
          textStyle: {
            fontSize: 20,
            fontWeight: "bold",
            color: "#333"
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {type: "cross"},
          backgroundColor: "rgba(0,0,0,0.7)", // 背景透明度
          textStyle: {color: "#fff"}, // 文字颜色为白色
          padding: [8, 12], // 内边距增加
          borderRadius: 4 // 边框圆角
        },
        legend: {
          data: ["项目数量", "平均成本 (¥)"],
          top: "10%",
          textStyle: {color: "#333", fontSize: 14}, // 图例字体颜色和大小
        },
        grid: {
          top: "20%", // 增加图表顶部的空隙
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: years,
          axisLabel: {
            interval: 0, // 确保所有标签都能显示
            rotate: 45, // 标签倾斜45度，避免重叠
            textStyle: {fontSize: 12, color: "#494949"}, // 坐标轴字体大小和颜色
          },
          axisLine: {
            lineStyle: {
              color: "#6b6b6b", // 黑色坐标轴线
            }
          },
          axisTick: {
            show: false // 去掉刻度线
          },
          splitLine: {
            show: false // 去掉分隔线
          }
        },
        yAxis: [
          {
            type: "value",
            name: "项目数量",
            position: "left",
            axisLabel: {formatter: "{value}"},
            axisLine: {
              lineStyle: {
                color: "#5f5f5f", // 黑色坐标轴线
              }
            },
            axisTick: {
              show: false // 去掉刻度线
            },
            splitLine: {
              lineStyle: {color: "#ddd", type: "dashed"} // 使用虚线做分隔线
            },
          },
          {
            type: "value",
            name: "平均成本 (¥)",
            position: "right",
            axisLabel: {formatter: "{value} ¥"},
            axisLine: {
              lineStyle: {
                color: "#292929", // 黑色坐标轴线
              }
            },
            axisTick: {
              show: false // 去掉刻度线
            },
            splitLine: {
              lineStyle: {color: "#ddd", type: "dashed"} // 使用虚线做分隔线
            },
          }
        ],
        series: [
          {
            name: "项目数量",
            type: "line",
            yAxisIndex: 0,
            data: projectCounts,
            smooth: true,
            areaStyle: {
              normal: {
                color: "rgba(109,233,255,0.4)" // 轻微透明的渐变色
              }
            },
            lineStyle: {color: "#7898ff", width: 3}, // 设置折线的颜色和宽度
            symbol: "circle", // 设置折线的节点样式
            symbolSize: 8, // 节点的大小
            itemStyle: {
              color: "#587ce2", // 设置折线点的颜色
            },
          },
          {
            name: "平均成本 (¥)",
            type: "line",
            yAxisIndex: 1,
            data: averageCosts,
            smooth: true,
            areaStyle: {
              normal: {
                color: "rgba(149,205,124,0.4)" // 轻微透明的渐变色
              }
            },
            lineStyle: {color: "#95cf79", width: 3}, // 设置折线的颜色和宽度
            symbol: "circle", // 设置折线的节点样式
            symbolSize: 8, // 节点的大小
            itemStyle: {
              color: "#87b471", // 设置折线点的颜色
            },
          },
        ],
      });
    }
  },
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.el-row {
  margin-bottom: 20px;
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-switch {
  margin-left: 10px;
}

.el-table {
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden; /* 避免内外边框相互重叠 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 给表格加个轻微的阴影 */
}

.el-table th, .el-table td {
  text-align: center;
  padding: 12px; /* 给表格单元格添加内边距 */
  font-size: 14px; /* 调整字体大小 */
}

.el-table th {
  background-color: #f5f7fa; /* 表头背景色 */
  color: #333; /* 表头文字颜色 */
  font-weight: 600; /* 表头字体加粗 */
  border-bottom: 2px solid #ddd; /* 表头底部加细边框 */
}

.el-table tr:nth-child(even) {
  background-color: #fafafa; /* 偶数行背景色 */
}

.el-table tr:nth-child(odd) {
  background-color: #ffffff; /* 奇数行背景色 */
}

.el-table .el-button {
  margin: 0 5px;
  background-color: #409eff; /* 按钮背景色 */
  color: #fff; /* 按钮文字颜色 */
  border-radius: 4px; /* 按钮圆角 */
  padding: 4px 12px; /* 按钮内边距 */
  font-size: 14px; /* 按钮文字大小 */
  transition: background-color 0.3s ease; /* 按钮悬停过渡 */
}

.el-table .el-button:hover {
  background-color: #66b1ff; /* 按钮悬停背景色 */
}

.el-table .el-button:focus {
  outline: none; /* 去掉按钮的默认焦点框 */
}

.el-table .el-table-column__cell {
  padding: 10px 16px; /* 调整单元格内边距 */
}

.el-table .el-table-column__cell span {
  font-weight: 400; /* 数据字体加轻微的粗体 */
}

.el-table-column__header {
  font-size: 14px;
}

.el-table th, .el-table td {
  border-right: 1px solid #eaeaea; /* 添加分隔线 */
}

.el-table th:last-child, .el-table td:last-child {
  border-right: none; /* 最后一列不加右边框 */
}

.el-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.el-card > .el-card__header {
  background-color: #f0f0f0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding: 10px;
}

.custom-tag {
  position: relative;
  display: inline-block;
  background-color: #d9ebff; /* 柔和的蓝色背景 */
  padding: 8px 24px 8px 12px; /* 增加宽度 */
  /*border: 1px solid #82b3ff; !* 边框颜色 *!*/
  font-weight: normal;
  font-size: 13px;
  color: #2b6fb3; /* 深蓝字体颜色 */
  border-radius: 4px;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%); /* 创建标签形状 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

.custom-tag::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-top: 25px solid transparent;
  border-bottom: 25px solid transparent;
  border-left: 16px solid #d9ebff; /* 背景色 */
  border-right: none;
  z-index: 1;
  transform: translateY(50%);
  border-color: transparent transparent transparent #82b3ff; /* 同边框色 */
}

#docx-container {
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  border-radius: 8px;
}

</style>


