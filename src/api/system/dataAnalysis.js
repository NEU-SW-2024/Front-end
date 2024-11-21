import request from '@/utils/request';

// 获取项目列表
export function getTenantProjects() {
    return request({
        url: '/reports/projectInfo/1',
        method: 'get',
    });

}

// 生成报告
export function generateReports(projectId) {
    return request({
        url: '/audit/add/'+ projectId,
        method: 'post',
    });

}
