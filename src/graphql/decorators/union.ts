import { QLResponseFactory } from '../factories';

export function QLUnion(config: { name: string; types: string[] }) {
  return (target: any) => {
    target.prototype.name = config.name;
    target.prototype.wrapperObject = QLResponseFactory.create(
      config.name,
    ).object;
    if (target.prototype.types) {
      target.prototype.types = [...target.prototype.types, ...config.types];
    } else {
      target.prototype.types = config.types;
    }
  };
}
