<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <hr />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>欢迎来到软件造价评估系统</h2>
        <div>
  <h1>本系统主要用于软件项目的系统评估。包括四大模块：租户和项目管理、功能点分析、造价综合评估、报告生成和展示。</h1>
  <!-- 
  <h1>租户管理</h1>
  <p>用于管理租户信息。对应小程序首页下部所展示的信息。功能包括：展示租户列表信息、导出租户列表信息、新增、修改、删除以及相关条件的搜索。搜索条件包括租户标识、联系人、电话、租户名称，且有列表重置功能。</p>
  
  <h1>首页简介管理</h1>
  <p>用于管理首页简介信息。对应小程序首页页面中部的信息展示。功能包括：修改、导出首页简介管理信息列表以及展示简介信息列表。</p>
  
  <h1>课程管理</h1>
  <p>用于管理用户的课程信息。对应小程序端的技术模块信息展示。功能包括：展示课程信息列表、新增、修改、删除以及导出课程信息列表和相关条件的搜索。搜索条件包括课程名称，且有列表重置功能。</p>
  
  <h1>资讯管理</h1>
  <p>本模块用于管理用户的行业动态信息。对应小程序端的动态模块的信息展示。功能包括：新增、修改、删除、导出资讯信息列表以及展示行业动态信息列表和相应条件的搜索。搜索条件包括新闻标题、作者，且有列表重置功能。</p> -->
  
  <!-- <h1>合作会议管理</h1>
  <p>用于管理用户的会议信息。对应小程序端的合作模块信息展示。功能包括：展示会议和合作信息列表、新增、修改、删除以及相关条件的搜索。搜索条件包括课程名称，且有列表重置功能。</p> -->
</div>
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 50px">
        <el-row>
          <el-col :span="12">
            <h2>项目技术栈</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <h4>后端技术</h4>
            <ul>
              <li>SpringBoot</li>
              <li>Spring Security</li>
              <li>Docker</li>
              <li>MySQL</li>
              <li>...</li>
            </ul>
          </el-col>
          <el-col :span="6">
            <h4>前端技术</h4>
            <ul>
              <li>Vue</li>
              <li>Vuex</li>
              <li>Element-ui</li>
              <li>Axios</li>
              <li>Sass</li>
              <li>...</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('3.8.7')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

