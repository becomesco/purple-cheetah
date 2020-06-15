import { QLInputPrototype } from '../interfaces';

export function QLInput(config: QLInputPrototype) {
  return (target: any) => {
    target.prototype.name = config.name;
    target.prototype.fields = config.fields;
    target.prototype.description = config.description;
  };
}
