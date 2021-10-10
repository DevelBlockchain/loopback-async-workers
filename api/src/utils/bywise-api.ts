import AbortController from 'abort-controller';
import { NodeDTO } from '../types';
const fetch = require("node-fetch");

export class BywiseAPI {

    private static async makeRequest(url: string, requestInit: RequestInit) {
        let response = {
            data: {},
            error: '',
        }
        const controller = new AbortController();
        const timeout = setTimeout(
            () => { controller.abort(); },
            30000,
        );
        try {
            const req = await fetch(url, requestInit).finally(() => {
                clearTimeout(timeout);
            });
            let text = await req.text();
            if (!req.ok) {
                response.error = 'bywise-api error: HTTP-CODE ' + req.status;
                if(text) {
                    let json = JSON.parse(text);
                    response.data = json;
                    response.error = 'bywise-api error: ' + json.error.message;
                }
            } else {
                if(text) {
                    let json = JSON.parse(text);
                    response.data = json;
                }
            }
        } catch (err: any) {
            response.error = 'bywise-api error: ' + err.message;
        }
        return response;
    }

    private static async get(url: string, token: string | undefined, parameters: any = {}) {
        let params = ''
        if (parameters) {
            params = '?' + encodeURI(JSON.stringify(params));
        }
        return await BywiseAPI.makeRequest(url + params, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'authorization': `Basic ${token}` } : {})
            },
        });
    }

    private static async post(url: string, token: string | undefined, parameters: any = {}) {
        return await BywiseAPI.makeRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'authorization': `Basic ${token}` } : {})
            },
            body: JSON.stringify(parameters)
        });
    }

    static tryToken(node: NodeDTO) {
        return BywiseAPI.get(`${node.host}/nodes/try-token`, node.token);
    }

    static getInfo(host: string) {
        return BywiseAPI.get(`${host}/nodes/info`, undefined);
    }
    
    static getNodes(host: string) {
        return BywiseAPI.get(`${host}/nodes`, undefined);
    }

    static tryHandshake(host: string, myNode: NodeDTO) {
        return BywiseAPI.post(`${host}/nodes/handshake`, undefined, myNode);
    }
}