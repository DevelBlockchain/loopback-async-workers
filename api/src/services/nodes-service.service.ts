import {injectable, BindingScope, Provider} from '@loopback/core';

@injectable({scope: BindingScope.TRANSIENT})
export class NodesProvider {

  static nodes = [];

  constructor() {}

}
