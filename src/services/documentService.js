import api from './api';

async function createDocument(){
        try{
        const response = await api.post(`/docs`);
        return response.data;

    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function getOneDoc(docId){
        try{
        const response = await api.get(`/docs/${docId}`);
        return response.data;

    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function updateDocument(docId){
        try{
        const response = await api.put(`/docs/edit/${docId}`);
        return response.data;

    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function verifyDocument(docId){
        try{
        const response = await api.put(`/docs/verify/${docId}`);
        return response.data;

    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

async function rejectDocument(docId){
        try{
        const response = await api.put(`/docs/reject/${docId}`);
        return response.data;

    }catch(error){
        throw new Error (error.response?.data?.message || error.message);
    }
}

export {
    createDocument,
    getOneDoc,
    updateDocument,
    verifyDocument,
    rejectDocument
}