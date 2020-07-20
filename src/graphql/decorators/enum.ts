export function QLEnum(config: { name: string; values: string[] }) {
  return (target: any) => {
    target.prototype.name = config.name;
    if (target.prototype.values) {
      target.prototype.values = [...target.prototype.values, ...config.values];
    } else {
      target.prototype.values = config.values;
    }
  };
}
