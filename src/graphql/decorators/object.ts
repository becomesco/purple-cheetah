import { QLResponseFactory } from '../factories';
import { QLFieldPrototype } from '../interfaces';

export function QLObject(config: {
  name: string;
  fields?: QLFieldPrototype[];
  type?: string;
}) {
  return (target: any) => {
    if (config.fields) {
      if (target.prototype.fields) {
        target.prototype.fields = [
          ...target.prototype.fields,
          ...config.fields,
        ];
      } else {
        target.prototype.fields = config.fields;
      }
    } else {
      if (!target.prototype.fields) {
        target.prototype.fields = [];
      }
    }
    target.prototype.wrapperObject = QLResponseFactory.create(
      config.name,
      config.type,
    ).object;
    target.prototype.name = config.name;
  };
}
