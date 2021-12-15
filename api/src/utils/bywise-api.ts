import AbortController from 'abort-controller';
import { NodeDTO, SliceDTO, TransactionsDTO } from '../types';
const fetch = require("node-fetch");

export class BywiseAPI {

    private static async makeRequest(url: string, requestInit: RequestInit): Promise<{ data: any, error: string }> {
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
        } catch (err: any) {
            response.error = 'bywise-api error: ' + err.message;
        }
        return response;
    }

    private static async get(url: string, token: string | undefined, parameters: any = {}) {
        let params = ''
        if (parameters) {
            params = '?' + (Object.entries(parameters).map(([key, value]) => {
                return `${key}=${encodeURI(JSON.stringify(value))}`;
            })).join('&');
        }
        console.log('make get', url + params)
        return await BywiseAPI.makeRequest(url + params, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Node ${token}` } : {})
            },
        });
    }

    private static async post(url: string, token: string | undefined, parameters: any = {}) {
        return await BywiseAPI.makeRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Node ${token}` } : {})
            },
            body: JSON.stringify(parameters)
        });
    }

    static publishNewSlice(node: NodeDTO, slice: SliceDTO) {
        return BywiseAPI.post(`${node.host}/api/v1/slices`, node.token, slice);
    }

    static publishNewTransaction(node: NodeDTO, tx: TransactionsDTO) {
        return BywiseAPI.post(`${node.host}/api/v1/transactions`, node.token, tx);
    }

    static getBlocks(node: NodeDTO, filter: any) {
        return BywiseAPI.get(`${node.host}/api/v1/blocks`, node.token, filter);
    }

    static getSlice(node: NodeDTO, sliceHash: string) {
        return BywiseAPI.get(`${node.host}/api/v1/slices/${sliceHash}`, node.token);
    }

    static getTransactionFromSlice(node: NodeDTO, sliceHash: string) {
        return BywiseAPI.get(`${node.host}/api/v1/slices/${sliceHash}/transactions`, node.token);
    }

    static tryToken(node: NodeDTO) {
        return BywiseAPI.get(`${node.host}/api/v1/nodes/try-token`, node.token);
    }

    static getInfo(host: string) {
        return BywiseAPI.get(`${host}/api/v1/nodes/info`, undefined);
    }

    static getNodes(host: string) {
        return BywiseAPI.get(`${host}/api/v1/nodes`, undefined);
    }

    static tryHandshake(host: string, myNode: NodeDTO) {
        return BywiseAPI.post(`${host}/api/v1/nodes/handshake`, undefined, myNode);
    }
}