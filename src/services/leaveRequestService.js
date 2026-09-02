import api from './api';

async function getLeaveRequestOptions(){
    try{
        const response = await api.get(`/leave-requests/options`);
        return response.data;

    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}
async function getMyLeaveRequests(){
    try{
        const response = await api.get(`/leave-requests/my`);
        return response.data;
        
    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function getTeamLeaveRequests(){
    try{
        
        const response = await api.get(`/leave-requests/team`);
        return response.data;
        
    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}
async function getAllLeaveRequests(){
    try{
        const response = await api.get(`/leave-requests/all`);
        return response.data;
        
    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function getLeaveRequestById(leaveId){
    try{
        const response = await api.get(`/leave-requests/${leaveId}`);
        return response.data;
        
    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function createLeaveRequest(body){
    try{
        const response = await api.post(`/leave-requests`, body);
        return response.data;
        
    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function approveLeaveRequest(leaveId, body){
    try{
        const response = await api.put(`/leave-requests/${leaveId}/approve`, body);
        return response.data;
        
    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function rejectLeaveRequest(leaveId, body){
    try{
        const response = await api.put(`/leave-requests/${leaveId}/reject`, body);
        return response.data;
        
    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function cancelLeaveRequest(leaveId, body){
    try{
        const response = await api.put(`/leave-requests/${leaveId}/cancel`, body);
        return response.data;

    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function overrideLeaveRequest(leaveId, status){
    try {
        const response = await api.put(`/leave-requests/${leaveId}/override`, { status });

        return response.data;
    } catch (error){
        throw new Error(error.response?.data?.message || error.message);
    }
}

export {
    getLeaveRequestOptions,
    createLeaveRequest,
    getMyLeaveRequests,
    getAllLeaveRequests,
    getTeamLeaveRequests,
    getLeaveRequestById,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest,
    overrideLeaveRequest
};

