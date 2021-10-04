import {Model, model, property} from '@loopback/repository';

@model()
export class NodeDTO extends Model {

  @property({
    type: 'string',
  })
  host: string;

  @property({
    type: 'boolean',
  })
  fullNode: boolean;

  constructor(data?: Partial<NodeDTO>) {
    super(data);
  }
}