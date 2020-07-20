import {
  QLObjectPrototype,
  QLInputPrototype,
  QLResolverPrototype,
  QLUnionPrototype,
  QLEnumPrototype,
} from '../interfaces';

export function QLEntry(config: {
  objects?: QLObjectPrototype[];
  inputs?: QLInputPrototype[];
  resolvers?: Array<QLResolverPrototype<any>>;
  unions?: QLUnionPrototype[];
  enums?: QLEnumPrototype[];
}) {
  return (target: any) => {
    if (config.objects) {
      if (target.prototype.objects) {
        target.prototype.objects = [
          target.prototype.objects,
          ...config.objects,
        ];
      } else {
        target.prototype.objects = config.objects;
      }
    } else {
      if (!target.prototype.objects) {
        target.prototype.objects = [];
      }
    }
    if (config.inputs) {
      if (target.prototype.inputs) {
        target.prototype.inputs = [
          ...target.prototype.inputs,
          ...config.inputs,
        ];
      } else {
        target.prototype.inputs = config.inputs;
      }
    } else {
      if (!target.prototype.inputs) {
        target.prototype.inputs = [];
      }
    }
    if (config.resolvers) {
      if (target.prototype.resolvers) {
        target.prototype.resolvers = [
          ...target.prototype.resolvers,
          ...config.resolvers,
        ];
      } else {
        target.prototype.resolvers = config.resolvers;
      }
    } else {
      if (!target.prototype.resolvers) {
        target.prototype.resolvers = [];
      }
    }
    if (config.unions) {
      if (target.prototype.unions) {
        target.prototype.unions = [
          ...target.prototype.unions,
          ...config.unions,
        ];
      } else {
        target.prototype.unions = config.unions;
      }
    } else {
      if (!target.prototype.unions) {
        target.prototype.unions = [];
      }
    }
    if (config.enums) {
      if (target.prototype.enums) {
        target.prototype.enums = [...target.prototype.enums, ...config.enums];
      } else {
        target.prototype.enums = config.enums;
      }
    } else {
      if (!target.prototype.enums) {
        target.prototype.enums = [];
      }
    }
  };
}
