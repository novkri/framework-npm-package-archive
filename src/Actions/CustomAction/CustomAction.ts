import { ActionMessage } from '../ActionMessage';
import {GetItemsActionParams} from "../GetItemsAction/GetItemsActionParams";

export class CustomAction extends ActionMessage {
  actionParameters: any;
  microserviceName: string;
  modelName: string;
  actionName: string;
  additionalParameters: any;

  constructor(microserviceName: string, modelName: string, actionName: string, actionParams?: any, additionalParams?:any) {
    const params = actionParams;
    const addParams = additionalParams ?? new GetItemsActionParams();
    super(microserviceName, modelName, actionName, params, addParams);
    this.actionParameters = params;
    this.additionalParameters = addParams;
    this.microserviceName = microserviceName;
    this.modelName = modelName;
    this.actionName = actionName;
  }
}
