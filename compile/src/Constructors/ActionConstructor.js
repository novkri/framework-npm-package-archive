"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionConstructor = void 0;
const GetItemsFilterParams_1 = require("../Actions/GetItemsAction/GetItemsFilterParams");
const GetItemsSortingParams_1 = require("../Actions/GetItemsAction/GetItemsSortingParams");
const GlobalVariables_1 = require("../GlobalVariables");
const CRUDAction_1 = require("../Actions/CRUDActions/CRUDAction");
const GetModelMetadataAction_1 = require("../Actions/GetMetadataAction/GetModelMetadataAction");
const CustomAction_1 = require("../Actions/CustomAction/CustomAction");
const GetItemsAction_1 = require("../Actions/GetItemsAction/GetItemsAction");
class ActionConstructor {
    constructor(url) {
        this.filterArr = [];
        this.ordersArr = [];
        this.withsArr = [];
        this.microserviceName = '';
        this.modelName = '';
        this.actionName = '';
        this.calledAction = '';
        this.actionParams = [];
        this.pagination = { per_page: undefined, page: undefined };
        this.id = '';
        this.url = url;
        this.setBaseUrl(this.url);
    }
    setBaseUrl(url) {
        GlobalVariables_1.GlobalVariables.httpBaseUrl = url;
    }
    clearParams() {
        this.filterArr = [];
        this.ordersArr = [];
        this.withsArr = [];
        this.pagination = { per_page: undefined, page: undefined };
        this.id = '';
        this.calledAction = '';
    }
    getMetadata(microserviceName, modelName) {
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionName = 'getMetadata';
        this.calledAction = 'getMetadata';
        return this;
    }
    getItems(microserviceName, modelName) {
        this.clearParams();
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionName = 'getItems';
        this.calledAction = 'getItems';
        return this;
    }
    getItem(microserviceName, modelName, id) {
        this.clearParams();
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionName = 'getItem';
        this.calledAction = 'getItem';
        this.id = id;
        return this;
    }
    create(microserviceName, modelName, actionParams) {
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionParams = actionParams;
        this.actionName = 'create';
        this.calledAction = 'create';
        return this;
    }
    update(microserviceName, modelName, actionParams) {
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionParams = actionParams;
        this.actionName = 'update';
        this.calledAction = 'update';
        return this;
    }
    delete(microserviceName, modelName, actionParams) {
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionParams = actionParams;
        this.actionName = 'delete';
        this.calledAction = 'delete';
        return this;
    }
    createMany(microserviceName, modelName, actionParams) {
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionParams = actionParams;
        this.actionName = 'createMany';
        this.calledAction = 'createMany';
        return this;
    }
    updateMany(microserviceName, modelName, actionParams) {
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionParams = actionParams;
        this.actionName = 'updateMany';
        this.calledAction = 'updateMany';
        return this;
    }
    updateManyWithFilter(microserviceName, modelName, actionParams) {
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionParams = actionParams;
        this.actionName = 'updateManyRaw';
        this.calledAction = 'updateManyRaw';
        return this;
    }
    deleteManyWithFilter(microserviceName, modelName, actionParams) {
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionParams = actionParams;
        this.actionName = 'deleteManyRaw';
        this.calledAction = 'deleteManyRaw';
        return this;
    }
    custom(microserviceName, modelName, actionName, actionParams) {
        this.clearParams();
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionParams = actionParams;
        this.actionName = actionName;
        this.calledAction = 'custom';
        return this;
    }
    getCount(microserviceName, modelName) {
        this.clearParams();
        this.microserviceName = microserviceName;
        this.modelName = modelName;
        this.actionName = 'getCount';
        this.calledAction = 'getCount';
        return this;
    }
    filter(filterObject, custom) {
        if (custom && custom === 'custom') {
            this.filterArr = filterObject;
        }
        else {
            const newFilterObj = new GetItemsFilterParams_1.GetItemsFilterParams(filterObject);
            newFilterObj.checkFilterType();
            this.filterArr = newFilterObj.formFilterObject();
        }
        return this;
    }
    withs(withs) {
        Array.isArray(withs) ? (this.withsArr = withs) : this.withsArr.push(withs);
        return this;
    }
    order(orders) {
        this.ordersArr = new GetItemsSortingParams_1.GetItemsSortingParams().createOrderObj(orders);
        return this;
    }
    setPagination(perPage, page) {
        this.pagination = { per_page: perPage, page: page };
        return this;
    }
    call() {
        return new Promise((resolve, reject) => {
            let result;
            let actionParameters = {
                pagination: this.pagination,
                filter: this.filterArr,
                withs: this.withsArr,
                order: this.ordersArr,
                id: this.id
            };
            GlobalVariables_1.GlobalVariables.tokenUST = this.microserviceName;
            switch (this.calledAction) {
                case 'getItems':
                case 'getItem':
                case 'getCount':
                    result = new GetItemsAction_1.GetItemsAction(this.microserviceName, this.modelName, this.actionName, actionParameters)
                        .axiosConnect(true)
                        .then((data) => {
                        resolve(data);
                    })
                        .catch((error) => {
                        reject(error);
                    });
                    break;
                case 'getMetadata':
                    result = new GetModelMetadataAction_1.GetModelMetadataAction(this.microserviceName, this.actionName, this.modelName)
                        .axiosConnect(true)
                        .then((data) => {
                        resolve(data);
                    })
                        .catch((error) => {
                        reject(error);
                    });
                    break;
                case 'custom':
                    result = new CustomAction_1.CustomAction(this.microserviceName, this.modelName, this.actionName, this.actionParams)
                        .axiosConnect(true)
                        .then((data) => {
                        resolve(data);
                    })
                        .catch((error) => {
                        reject(error);
                    });
                    break;
                default:
                    result = new CRUDAction_1.CRUDAction(this.microserviceName, this.modelName, this.actionName, this.actionParams)
                        .axiosConnect(true)
                        .then((data) => {
                        resolve(data);
                    })
                        .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
}
exports.ActionConstructor = ActionConstructor;
