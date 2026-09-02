import api from './api'


async function createUser(formData) {
    const response = await api.post('/user', formData)
    return response.data
}

async function allUsers() {
    const response = await api.get('/user/allUsers')
    return response.data
}

async function allManager() {
    const response = await api.get('/user/allManager')
    return response.data
}

async function getUserById(userId) {
    const response = await api.get(`/user/${userId}`)
    return response.data
}

async function updateEmployee(userId, formData) {
    const response = await api.put(`/user/edit/${userId}`, formData)
    return response.data
}

async function deactivateUser(userId) {
    const response = await api.put(
        `/user/deactivate/${userId}`
    );

    return response.data;
}

async function reactivateUser(userId) {
    const response = await api.put(
        `/user/reactivate/${userId}`
    );

    return response.data;
}

export { createUser, allUsers, allManager, getUserById, deactivateUser, reactivateUser, updateEmployee }