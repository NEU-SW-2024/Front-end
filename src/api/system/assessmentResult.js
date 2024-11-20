import request from '@/utils/request'

// 获取所有评估结果列表
export function listAssessmentResults(query) {
  return request({
    url: '/api/assessment-results/list',
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

// 新增评估结果
export function addAssessmentResult(data) {
  return request({
    url: '/api/assessment-results/create',
    method: 'post',
    data: data // 提交评估结果数据
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

//获得项目列表
export function listProjects(query){
  return request({
    url: `/accessor/getAll?${projectId}`,
    method: 'get',
    params: query // 通过查询参数传递筛选条件
  })
}