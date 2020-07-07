import { QLObjectPrototype } from '../interfaces';

export class QLResponseFactory {
  public static create(
    edgeName: string,
    edgeType?: string,
  ): {
    name: string;
    object: QLObjectPrototype;
  } {
    const eName = `${edgeName.replace(/\[/g, '').replace(/\]/g, '')}Response`;
    const eType = typeof edgeType !== 'string' ? edgeName : edgeType;
    return {
      name: eName,
      object: {
        name: eName,
        fields: [
          {
            name: 'error',
            type: 'ResponseError',
          },
          {
            name: eType.startsWith('[') ? 'edges' : 'edge',
            type: eType,
          },
        ],
      },
    };
  }
}
