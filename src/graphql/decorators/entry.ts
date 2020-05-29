import {
  QLObjectPrototype,
  QLInputPrototype,
  QLResolverPrototype,
} from '../interfaces';

export function QLEntry(config: {
  objects?: QLObjectPrototype[];
  inputs?: QLInputPrototype[];
  resolvers?: Array<QLResolverPrototype<any>>;
}) {
  return (target: any) => {
    if (target.prototype.objects) {
      target.prototype.objects = [target.prototype.objects, ...config.objects];
    } else {
      target.prototype.objects = config.objects || [];
    }
    if (target.prototype.inputs) {
      target.prototype.inputs = [target.prototype.inputs, ...config.inputs];
    } else {
      target.prototype.inputs = config.inputs || [];
    }
    if (target.prototype.resolvers) {
      target.prototype.resolvers = [
        target.prototype.resolvers,
        ...config.resolvers,
      ];
    } else {
      target.prototype.resolvers = config.resolvers || [];
    }
  };
}
