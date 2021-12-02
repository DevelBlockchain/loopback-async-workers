import { toast } from 'react-toastify';
import Auth from "./auth"

const API = process.env.REACT_APP_API_URL;

const makeRequest = async (url, requestInit, toastError = true) => {
    let response = {
        data: {},
        error: '',
    }
    try {
        const req = await fetch(`${API}/api/v1${url}`, requestInit);
        let text = await req.text();
        if (req.status < 200 || req.status >= 300) {
            if (req.status === 401) {
                Auth.logout();
            }
            response.error = 'bywise-api error: HTTP-CODE ' + req.status;
            if (text) {
                let json = JSON.parse(text);
                response.data = json;
                response.error = 'bywise-api error: ' + json.error.message;
            }
        } else {
            if (text) {
                let json = JSON.parse(text);
                response.data = json;
            }
        }
    } catch (err) {
        response.error = 'bywise-api error: ' + err.message;
    }
    if (response.error) {
        if(toastError) {
            toast.error(response.error);
        }
        console.log(response);
    }
    return response;
}

const get = async (url, parameters = {}, toastError = true) => {
    let token = Auth.getToken();
    let params = ''
    if (parameters) {
        params = '?' + (Object.entries(parameters).map(([key, value]) => {
            return `${key}=${encodeURI(JSON.stringify(value))}`;
        })).join('&');
    }
    return await makeRequest(url + params, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'authorization': `Bearer ${token}` } : {})
        },
    }, toastError);
}

const post = async (url, parameters = {}, toastError = true) => {
    let token = Auth.getToken();
    return await makeRequest(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(parameters)
    }, toastError);
}

const del = async (url, parameters = {}, toastError = true) => {
    let token = Auth.getToken();
    return await makeRequest(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(parameters)
    }, toastError);
}

export default class BywiseAPI {
    static getURL = () => API

    static get = get;
    static post = post;
    static del = del;
}