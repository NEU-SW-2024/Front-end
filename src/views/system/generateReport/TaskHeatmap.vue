<template>
  <div class="heatmap-container">
    <div class="heatmap-wrapper">
      <div ref="heatmap" class="heatmap"></div>
      <div class="legend">
        <span>Less</span>
        <span v-for="color in legendColors" :key="color" :style="{ backgroundColor: color }" class="legend-color"></span>
        <span>More</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "TaskHeatmap",
  props: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  data() {
    return {
      values: {}, // 任务完成数据
      legendColors: ["#ebedf0", "#a6e7a6", "#5cc25f", "#49a04a", "#196127"],
    };
  },
  mounted() {
    this.generateMonthlyData();
    this.createHeatmap();
  },
  methods: {
    // 生成每个月的任务完成数据
    generateMonthlyData() {
      const taskCounts = {
        0: 5,  // 1月 5个任务
        1: 8,  // 2月 8个任务
        2: 10, // 3月 10个任务
        3: 6,  // 4月 6个任务
        4: 7,  // 5月 7个任务
        5: 9,  // 6月 9个任务
        6: 12, // 7月 12个任务
        7: 15, // 8月 15个任务
        8: 10, // 9月 10个任务
        9: 8,  // 10月 8个任务
        10: 5, // 11月 5个任务
        11: 7, // 12月 7个任务
      };

      const dates = d3.timeDays(this.startDate, this.endDate);

      // 初始化 values
      this.values = {};

      // 为每个月生成分散的数据
      dates.forEach(date => {
        const month = date.getMonth();
        if (taskCounts[month] > 0 && Math.random() > 0.7) {
          // 随机任务完成数量
          this.values[d3.timeFormat("%Y-%m-%d")(date)] = Math.floor(Math.random() * 5) + 1;
          taskCounts[month] -= 1;
        }
      });

      // 补充未分配的任务
      Object.keys(taskCounts).forEach(month => {
        let remainingTasks = taskCounts[month];
        let attempts = 0; // 尝试次数限制，防止无限循环

        while (remainingTasks > 0 && attempts < 100) {
          const monthDates = dates.filter(d => d.getMonth() === parseInt(month));
          const randomDate = monthDates[Math.floor(Math.random() * monthDates.length)];
          const dateKey = d3.timeFormat("%Y-%m-%d")(randomDate);

          if (!this.values[dateKey]) {
            this.values[dateKey] = Math.floor(Math.random() * 5) + 1;
            remainingTasks -= 1;
          }

          attempts += 1;
        }

        // 检查是否成功分配了所有任务
        if (remainingTasks > 0) {
          console.warn(`月 ${month + 1} 未能完全分配任务，剩余: ${remainingTasks}`);
        }
      });
    },

    // 创建热力图
    createHeatmap() {
      const data = this.values;
      const startDate = this.startDate;
      const endDate = this.endDate;

      const width = 900;
      const height = 200;
      const cellSize = 7;
      const padding = 4;
      const color = d3.scaleLinear()
          .domain([0, 1, 2, 3, 4, 5])
          .range(this.legendColors);

      const svg = d3.select(this.$refs.heatmap)
          .append("svg")
          .attr("width", width + 60)
          .attr("height", height + 40)
          .append("g")
          .attr("transform", `translate(50, 20)`);

      const timeWeek = d3.timeFormat("%U");
      const timeDay = d3.timeFormat("%w");
      const timeMonth = d3.timeFormat("%b");

      const dates = d3.timeDays(startDate, endDate);

      // 左侧的周标签
      const daysOfWeek = ["Mon", "Wed", "Fri"];
      const dayIndices = [1, 3, 5];

      svg.selectAll("text.day-of-week")
          .data(daysOfWeek)
          .enter()
          .append("text")
          .attr("class", "day-of-week")
          .attr("x", -10)
          .attr("y", (d, i) => dayIndices[i] * (cellSize + padding))
          .attr("dy", "0.8em")
          .attr("text-anchor", "end")
          .style("font-size", "12px")
          .text(d => d);

      // 生成月份标签
      const months = d3.timeMonths(startDate, endDate);
      svg.selectAll("text.month")
          .data(months)
          .enter()
          .append("text")
          .attr("class", "month")
          .attr("x", d => timeWeek(d) * (cellSize + padding) + cellSize / 2)
          .attr("y", -8)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .text(d => timeMonth(d));

      // 绘制日期块
      svg.selectAll("rect.day")
          .data(dates)
          .enter()
          .append("rect")
          .attr("class", "day")
          .attr("width", cellSize)
          .attr("height", cellSize)
          .attr("x", d => timeWeek(d) * (cellSize + padding))
          .attr("y", d => timeDay(d) * (cellSize + padding))
          .attr("fill", d => color(data[d3.timeFormat("%Y-%m-%d")(d)] || 0))
          .attr("stroke", "#ccc")

          .attr("rx", 4)
          .attr("ry", 4);
    },
  },
};
</script>

<style scoped>
.heatmap-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  padding: 20px;
  width: 90%;
  max-width: 1200px;
  text-align: center; /* 确保内容在框中居中 */
}

.heatmap-wrapper {
  width: 100%;
}

svg {
  font: 12px sans-serif;
  margin: 0 auto; /* 确保 SVG 图表水平居中 */
}

.month {
  font-size: 8px;
  fill: #333;
}

.day-of-week {
  font-size: 12px;
  fill: #333;
}

.legend {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
  gap: 5px;
  font-size: 12px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
