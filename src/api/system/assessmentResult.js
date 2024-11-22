import request from '@/utils/request'

// 获取所有评估结果列表
export function listAssessmentResults(query) {
  return request({
    url: '/api/assessment-results/list',
    method: 'get',
    params: query // 通过查询参数传递筛选条件
  })
}
// 获取所有评估结果细节列表
export function listAssessmentResultsDetail(query) {
  return request({
    url: '/api/assessment-detail-results/list',
    method: 'get',
    params: query // 通过查询参数传递筛选条件
  })
}

// 根据ID获取评估结果详情
export function getAssessmentResultById(resId) {
  return request({
    url: `/api/assessment-results/${resId}`,
    method: 'get'
  })
}

// 根据ID获取评估结果详情
export function getAssessmentResultDetailById(resId) {
  return request({
    url: `/api/assessment-detail-results/${resId}`,
    method: 'get'
  })
}

// 新增评估结果
export function addAssessmentResult(data) {
  return request({
    url: '/api/assessment-results/create',
    method: 'post',
    data: data // 提交评估结果数据
  })
}

export function addAssessmentResultDetail(data){
	return request({
		url:`/api/assessment-detail-results/create`,
		method:'post',
		data:data
	})
}


// 修改评估结果
export function updateAssessmentResult(data) {
  return request({
    url: '/api/assessment-results/update',
    method: 'put',
    data: data // 提交修改后的评估结果数据
  })
}

// 删除评估结果
export function delAssessmentResult(resId) {
  return request({
    url: `/api/assessment-results/${resId}`,
    method: 'delete'
  })
}

// 删除评估结果细节
export function delAssessmentResultDetail(resId) {
  return request({
    url: `/api/assessment-detail-results/${resId}`,
    method: 'delete'
  })
}

//获得项目列表
export function listProjects(query){
  return request({
    url: `/dev-api/accessor/getAll?${projectId}`,
    method: 'get',
    params: query // 通过查询参数传递筛选条件
  })
}

//获取所有待评估项目
export function  listFeats(query){
	return request({
		url:`/dev-api/accessor/getPendingProjects`,
		method:'get',
		params: query // 通过查询参数传递筛选条件
	})
	
}

// 计算评估结果
export function calculateResult(data) {
  return request({
    url: '/system/assessment-standards/calculate',
    method: 'post',
    data: {
      projectId: data.projectId,  // 项目ID
      stdId: data.stdId          // 标准ID
    }
  })
}

export function calculateAssessmentDetailResult(data) {
  return request({
    url: '/api/assessment-detail-results/calculate',
    method: 'post',
    data: {
      projectId: data.projectId,
      stdId: data.stdId
    }
  })
}

// 获取项目DFP
export function getProjectDFP(projectId) {
  return request({
    url: '/dev-api/accessor/getDFP',
    method: 'get',
    params: {
      projectId
    }
  })
}

export function getProjectName(projectId) {
 return request({
   url: '/dev-api/accessor/getProjectName',
   method: 'get',
   params: { projectId }
 })
}


// 更改测评状态的接口函数
export function changeCalculationStatus(data) {
  return request({
    url: '/dev-api/accessor/changeStatus',
    method: 'post',
    data: {
      projectId: data.projectId
    }
  })
}