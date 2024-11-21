import request from '@/utils/request';

// 获取项目列表
export function getTenantProjects() {
    return request({
        url: '/reports/projectInfo',
        method: 'get',
    });

}
