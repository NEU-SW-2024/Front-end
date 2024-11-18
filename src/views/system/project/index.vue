<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="项目名称" prop="name">
            <el-input
               v-model="queryParams.name"
               placeholder="请输入项目名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="租户ID" prop="tenantId">
            <el-input
               v-model="queryParams.tenantId"
               placeholder="请输入租户ID"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:project:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:project:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:project:remove']"
            >删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="项目ID" align="center" prop="projectId" width="100" />
         <el-table-column
            label="项目名称"
            align="center"
            prop="name"
            :show-overflow-tooltip="true"
         />
         <el-table-column label="项目描述" align="center" prop="description" width="200" />
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:project:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:project:remove']" >删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 添加或修改项目对话框 -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
         <el-form ref="projectRef" :model="form" :rules="rules" label-width="80px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="项目名称" prop="name">
                     <el-input v-model="form.name" placeholder="请输入项目名称" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="租户ID" prop="tenantId">
                     <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="评估师ID" prop="accessorId">
                     <el-input v-model="form.accessorId" placeholder="请输入评估师ID" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="审核师ID" prop="auditorId">
                     <el-input v-model="form.auditorId" placeholder="请输入审核师ID" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="项目状态" prop="projectStatus">
                     <el-input v-model="form.projectStatus" placeholder="请输入项目状态" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="预计耗时" prop="estimatedTime">
                     <el-input v-model="form.estimatedTime" placeholder="请输入预计持续时间" />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="项目描述" prop="description">
                     <el-input v-model="form.description" placeholder="请输入项目描述" />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="项目内容">
                    <editor v-model="form.projectContent" :min-height="192"/>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Project">
import { listProject, getProject, delProject, addProject, updateProject } from "@/api/system/project";

const { proxy } = getCurrentInstance();

const projectList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    tenantId: undefined
  },
  rules: {
    name: [{ required: true, message: "项目名称不能为空", trigger: "blur" }],
    tenantId: [{ required: true, message: "租户ID不能为空", trigger: "blur" }],
    accessorId: [{ required: true, message: "评估师ID不能为空", trigger: "blur" }],
    auditorId: [{ required: true, message: "审核师ID不能为空", trigger: "blur" }],
    projectStatus: [{ required: true, message: "项目状态不能为空", trigger: "blur" }],
    estimatedTime: [{ required: true, message: "预计持续时间不能为空", trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目列表 */
function getList() {
  loading.value = true;
  listProject(queryParams.value).then(response => {
    projectList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    projectId: undefined,
    name: undefined,
    tenantId: undefined,
    description: undefined,
    projectContent: undefined,
    accessorId: undefined,
    auditorId: undefined,
    projectStatus: undefined,
    estimatedTime: undefined
  };
  proxy.resetForm("projectRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.projectId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加项目";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const projectId = row.projectId || ids.value;
  getProject(projectId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改项目";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["projectRef"].validate(valid => {
    if (valid) {
      if (form.value.projectId != undefined) {
        updateProject(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProject(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const projectIds = row.projectId || ids.value
  proxy.$modal.confirm('是否确认删除项目编号为"' + projectIds + '"的数据项？').then(function() {
    return delProject(projectIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>