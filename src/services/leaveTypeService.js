import api from './api';

async function getLeaveTypes(){
    try{
        const response = await api.get(`/leave-types`);
        return response.data;

    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function getLeaveTypeById(leaveTypeId){
    try{
        const response = await api.get(`/leave-types/${leaveTypeId}`);
        return response.data;

    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

export {
    getLeaveTypes,
    getLeaveTypeById
}