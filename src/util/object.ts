export interface ObjectSchema {
  [key: string]: {
    __type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    __required: boolean;
    __child?:
      | {
          __type?: 'string' | 'number' | 'boolean' | 'object';
          __content?: ObjectSchema;
        }
      | ObjectSchema;
  };
}

/**
 * Utility class for object manipulation.
 */
export class ObjectUtility {
  /**
   * Compare object with a schema. If object does not
   * follow the rules specified by schema, error will be
   * thrown with message that describes an error. Use this
   * method in a try-catch block.
   *
   * @param object Object that will be checked.
   * @param schema Schema that object must follow.
   * @param level Since function is recursive, level indicates
   *    what property is being converted. Used for throwing errors.
   */
  public static compareWithSchema(
    object: any,
    schema: ObjectSchema,
    level?: string,
  ): void {
    if (typeof level === 'undefined') {
      level = 'root';
    }
    if (typeof object === 'undefined') {
      throw new Error(`${level}: 'object' cannot be 'undefined'`);
    }
    if (typeof schema === 'undefined') {
      throw new Error(`${level}: 'schema' cannot be 'undefined'`);
    }
    for (const key in schema) {
      if (typeof object[key] === 'undefined') {
        if (schema[key].__required === true) {
          throw new Error(`${level}: Object is missing property '${key}'.`);
        }
      } else {
        if (object[key] instanceof Array) {
          if (schema[key].__type === 'array') {
            if (object[key].length > 0) {
              if (typeof object[key][0] === 'object') {
                if (schema[key].__child.__type !== 'object') {
                  throw new Error(
                    `${level}: Type mismatch at '${key}'. Expected '${schema[key].__child.__type}' but got 'object'.`,
                  );
                }
                // tslint:disable-next-line: forin
                for (const i in object[key]) {
                  ObjectUtility.compareWithSchema(
                    object[key][i],
                    schema[key].__child.__content as ObjectSchema,
                    level + `.${key}`,
                  );
                }
              } else {
                const checkType = object[key].find(
                  (e) => typeof e !== schema[key].__child.__type,
                );
                if (checkType) {
                  throw new Error(
                    `${level}: Type mismatch found in an array '${key}'. Expected '${
                      schema[key].__child.__type
                    }' but got a '${typeof checkType}'.`,
                  );
                }
              }
            }
          } else {
            throw new Error(
              `${level}: Type mismatch of property '${key}'. Expected 'object.array' but got '${typeof object[
                key
              ]}'.`,
            );
          }
        } else {
          if (typeof object[key] !== schema[key].__type) {
            throw new Error(
              `${level}: Type mismatch of property '${key}'. Expected '${
                schema[key].__type
              }' but got '${typeof object[key]}'.`,
            );
          }
          if (schema[key].__type === 'object') {
            ObjectUtility.compareWithSchema(
              object[key],
              schema[key].__child as ObjectSchema,
              level + `.${key}`,
            );
          }
        }
      }
    }
  }

  /**
   * Converts object schema to JavaScript object.
   *
   * @param schema Schema of an Object
   * @param level Since function is recursive, level indicates
   *    what property is being converted. Used for throwing errors.
   */
  public static schemaToObject(schema: any, level?: string): any {
    if (!level) {
      level = 'root';
    }
    const object: any = ObjectUtility.typeToValue(schema.__type);
    if (schema.__type === 'object') {
      // tslint:disable-next-line:forin
      for (const key in schema.__child) {
        object[key] = ObjectUtility.schemaToObject(
          schema.__child[key],
          `level.${key}`,
        );
      }
    }
    return object;
  }

  /**
   * Generate a schema object based on object that is parsed. Will
   * throw an error with a message if problem is detected. Use
   * this method in a try-catch block.
   *
   * @param object Based on this object, schema will be generated.
   * @param level Property that is converted.
   */
  public static objectToSchema(object: any, level?: string): any {
    if (!level) {
      level = 'root';
    }
    if (!object) {
      return undefined;
    }
    let schema = {};
    if (typeof object !== 'object') {
      schema = {
        __required: true,
        __type: typeof object,
      };
    } else {
      for (const key in object) {
        if (typeof object[key] === 'object') {
          if (object[key] instanceof Array) {
            if (object[key].length > 0) {
              let childType = 'unknown';
              // tslint:disable-next-line: forin
              for (const childKey in object[key]) {
                childType = typeof object[key][childKey];
                break;
              }
              if (childType === 'object') {
                schema[key] = {
                  __required: true,
                  __type: 'array',
                  __child: {
                    __type: childType,
                    __content: ObjectUtility.objectToSchema(
                      object[key][0],
                      level + `.${key}`,
                    ),
                  },
                };
              } else {
                schema[key] = {
                  __required: true,
                  __type: 'array',
                  __child: {
                    __type: childType,
                  },
                };
              }
            } else {
              throw new Error(
                `${level}: Cannot create schema from empty array.`,
              );
            }
          } else {
            let childType = 'unknown';
            // tslint:disable-next-line: forin
            for (const childKey in object[key]) {
              childType = typeof object[key][childKey];
              break;
            }
            if (childType === 'object') {
              schema[key] = {
                __required: true,
                __type: 'array',
                __child: {
                  __type: childType,
                  __content: ObjectUtility.objectToSchema(
                    object[key],
                    level + `.${key}`,
                  ),
                },
              };
            } else {
              schema[key] = {
                __required: true,
                __type: childType,
              };
            }
          }
        } else {
          schema[key] = {
            __required: true,
            __type: typeof object[key],
          };
        }
      }
    }
    return schema;
  }

  /**
   * Converts property type to its value.
   */
  private static typeToValue(type: string): any {
    switch (type) {
      case 'object': {
        return {};
      }
      case 'array': {
        return [];
      }
      case 'string': {
        return '';
      }
      case 'number': {
        return 0;
      }
      case 'boolean': {
        return false;
      }
    }
    return undefined;
  }
}
