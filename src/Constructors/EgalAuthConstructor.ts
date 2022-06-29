import { AuthAction } from '../Auth/AuthAction';

export class EgalAuthConstructor extends AuthAction {
  egalAuth: AuthAction;
  url: string;
  constructor(authParams: { modelName: string; url: string; connectionType: string; microserviceName?:string }) {
    super(authParams.modelName, authParams.connectionType, authParams.microserviceName);
    this.egalAuth = new AuthAction(authParams.modelName, authParams.connectionType, authParams.microserviceName);
    this.url = authParams.url;
    this.initAuthAction();
  }
  initAuthAction(): any {
    this.egalAuth.setBaseURL(this.url);
    return this.egalAuth;
  }
}
