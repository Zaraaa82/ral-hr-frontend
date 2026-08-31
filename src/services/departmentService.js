import api from './api'


async function createDepartment(formData) {
    const response = await api.post('/dep', formData)
    return response.data
}

async function getAllDepartments(depId) {
    const response = await api.get(`/dep`)
    return response.data
}

async function getDepById(depId) {
    const response = await api.get(`/dep/${depId}`)
    return response.data
}

async function updateDepartment(formData, depId) {
    const response = await api.put(`/dep/edit/${depId}`, formData)
    return response.data
}

export { createDepartment, getDepById, updateDepartment, getAllDepartments }