import request from '@/utils/request';

// 项目批准接口
export function approveProject(projectId) {
    return request({
        url: '/audit/updateToCompleted/'+ projectId,
        method: 'post',
        data: { projectId },
    });
}

// 项目驳回接口
export function rejectProject(projectId) {
    return request({
        url: '/audit/updateToPendingEvaluation/'+ projectId,
        method: 'post',
        data: { projectId },
    });

}


