import {ActionMessage} from "../ActionMessage";
import {Method} from "axios";

export class CustomAction extends ActionMessage {
    actionParameters: any;
    microserviceName: string;
    modelName: string;
    actionName: string;
    username: string;
    password: string;

    constructor(username: string, password: string, microserviceName: string, modelName: string, actionName: string, actionParams?: any) {
        const params = actionParams;
        super(username, password, microserviceName, modelName, actionName, params);
        this.actionParameters = params;
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionName = actionName;
        this.username = username;
        this.password = password;
    }
}
