import request from '@/utils/request'

// 获取所有标准列表
export function listStandards(query) {
  return request({
    url: '/system/assessment-standards/list',
    method: 'get',
    params: query // 通过查询参数传递筛选条件
  })
}

// 根据ID获取标准详情
export function getStandardById(stdId) {
  return request({
    url: `/system/assessment-standards/detail/${stdId}`,
    method: 'get'
  })
}

// 新增标准
export function addStandard(data) {
  return request({
    url: '/system/assessment-standards/create',
    method: 'post',
    data: data // 提交标准数据
  })
}

// 修改标准
export function updateStandard(data) {
  return request({
    url: '/system/assessment-standards/update',
    method: 'put',
    data: data // 提交修改后的标准数据
  })
}

// 删除标准
export function delStandard(stdId) {
  return request({
    url: `/system/assessment-standards/${stdId}`,
    method: 'delete'
  })
}
