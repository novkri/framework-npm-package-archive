import axios, {Method} from 'axios';
import {ActionResult} from '../ActionResponses/ActionResult';
import {ActionError} from '../ActionResponses/ActionError';
import {ActionParameters} from '../Interfaces/ActionParameters';
import {getCookie, GlobalVariables, deleteCookie, setCookie} from '../../GlobalVariables';

let isRefreshing = false;
let refreshSubscribers: any[] = [];
let initialRequest: any = undefined;

export class HttpRequest {
    actionResult: ActionResult;
    actionError: ActionError;

    constructor() {
        this.actionResult = {} as ActionResult;
        this.actionError = {} as ActionError;
    }

    subscribeTokenRefresh(cb: any): void {
        refreshSubscribers.push(cb);
    }

    onRefreshed(token: any): void {
        refreshSubscribers.map((cb) => cb(token));
    }

    async refreshAccessToken(serviceName: string) {
        axios.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const {config} = error;
                if (error.response.data.action_error.internal_code === 'umt_expired') {
                    this.refreshMasterToken().then(() => {
                        this.refreshAccessToken(serviceName).then(() => {
                            initialRequest.headers['Authorization'] = getCookie(serviceName);
                            axios(initialRequest);
                            refreshSubscribers = [];
                        })
                    }).catch((error) => {
                        return error
                    })
                } else {
                    return error;
                }
            }
        );
        if (localStorage.getItem('umt') && localStorage.getItem('umrt')) {
            let domain = GlobalVariables.httpBaseUrl
                ? GlobalVariables.httpBaseUrl
                : GlobalVariables.authBaseUrl;
            delete axios.defaults.headers.Authorization;
            deleteCookie(serviceName);
            await axios({
                url: `${domain}/auth/User/loginToService`,
                method: 'POST',
                data: {
                    service_name: serviceName,
                    token: localStorage.getItem('umt')
                }
            })
                .then((response) => {
                    deleteCookie(serviceName);
                    setCookie(serviceName, response.data.action_result.data)
                    this.onRefreshed(response.data.action_result.data)
                    return response.data.action_result.data;
                })
                .catch((error) => {
                    return error;
                });
        }
    }

    async refreshMasterToken() {
        if (localStorage.getItem('umrt')) {
            let domain = GlobalVariables.httpBaseUrl
                ? GlobalVariables.httpBaseUrl
                : GlobalVariables.authBaseUrl;
            delete axios.defaults.headers.Authorization;
            await axios({
                url: `${domain}/auth/User/refreshUserMasterToken`,
                method: 'POST',
                data: {
                    token: localStorage.getItem('umrt')
                }
            })
                .then((response: any) => {
                    localStorage.setItem(
                        'umrt',
                        response.data.action_result.data.user_master_refresh_token
                    );
                    localStorage.setItem('umt', response.data.action_result.data.user_master_token);
                })
                .catch((error) => {
                    localStorage.removeItem('umrt')
                    return error;
                });
        } else {
            return new ActionError('Session expired!', 401).getMessage()
        }
    }

    axiosConnect(
        serviceName: string,
        modelName: string,
        actionName: string,
        httpMethod: Method,
        actionParameters: ActionParameters | undefined,
        tokenName?: string
    ): Promise<any> {
        let domain = GlobalVariables.httpBaseUrl
            ? GlobalVariables.httpBaseUrl
            : GlobalVariables.authBaseUrl;
        let userTokenName = tokenName ? tokenName : GlobalVariables.tokenUST;
        let instance = axios.create();
        if (
            actionName !== 'register' &&
            actionName !== 'login' &&
            actionName !== 'loginToService' &&
            actionName !== 'loginAndGetRefreshToken'
        ) {
            instance.defaults.headers.common['Authorization'] = getCookie(userTokenName);
        }
        instance.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const {config} = error;
                const originalRequest = config;
                initialRequest = originalRequest;
                if (
                    error.response.data.action_error.code === 401 &&
                    error.response.data.action_error.internal_code === 'ust_expired'
                ) {
                    if (!isRefreshing) {
                        isRefreshing = true;
                        this.refreshAccessToken(serviceName).then(() => {
                            isRefreshing = false;
                        })
                    }
                    return new Promise((resolve, reject) => {
                        this.subscribeTokenRefresh((token: any) => {
                            originalRequest.headers['Authorization'] = token;
                            deleteCookie(serviceName);
                            setCookie(serviceName, token)
                                .then(() => {
                                    resolve(instance(originalRequest));
                                    refreshSubscribers = [];
                                })
                                .catch((error) => {
                                    reject(error);
                                });
                        });
                    });
                } else {
                    return Promise.reject(error);
                }
            }
        );
        return new Promise((resolve, reject) => {
            let data;
            switch (actionName) {
                case 'register':
                case 'login':
                case 'loginToService':
                case 'loginAndGetRefreshToken':
                case 'getItems':
                case 'getItem':
                case 'delete':
                case 'getCount':
                case 'updateManyRaw':
                case 'deleteManyRaw':
                case 'deleteMany':
                    data = actionParameters;
                    break;
                case 'createMany':
                case 'updateMany':
                    const actionManyParams = {objects: {}};

                    // @ts-ignore
                    actionManyParams.objects = actionParameters;
                    data = actionManyParams;
                    break;
                default:
                    const parameters = {attributes: {}};
                    // @ts-ignore
                    parameters.attributes = actionParameters;
                    data = parameters;
            }
            if (GlobalVariables.httpBaseUrl || GlobalVariables.authBaseUrl) {
                instance({
                    url: `${domain}/${serviceName}/${modelName}/${actionName}`,
                    method: httpMethod,
                    data: data
                })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error.response);
                    });
            } else {
                this.actionError = new ActionError('Укажите URL!');
                reject(this.actionError.getMessage());
            }
        });
    }
}