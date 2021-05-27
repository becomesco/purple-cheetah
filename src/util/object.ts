import type {
  ObjectPropSchemaArrayChild,
  ObjectSchema,
  ObjectUtility,
} from '../types';

const objectUtility: ObjectUtility = {
  compareWithSchema(object, schema, level) {
    if (typeof level === 'undefined') {
      level = 'root';
    }
    if (typeof object === 'undefined') {
      return { ok: false, error: `${level}: 'object' cannot be 'undefined'` };
    }
    if (typeof schema === 'undefined') {
      return { ok: false, error: `${level}: 'schema' cannot be 'undefined'` };
    }

    const schemaKeys = Object.keys(schema);
    for (let i = 0; i < schemaKeys.length; i++) {
      const schemaKey = schemaKeys[i];
      if (typeof object[schemaKey] === 'undefined') {
        if (schema[schemaKey].__required) {
          return {
            ok: false,
            error: `${level}: Object is missing property '${schemaKey}'.`,
          };
        }
      } else {
        if (object[schemaKey] instanceof Array) {
          if (schema[schemaKey].__type === 'array') {
            if (!schema[schemaKey].__child) {
              return {
                ok: false,
                error:
                  `${level}: Schema property has type of array but` +
                  ` "__chile" property was not specified.`,
              };
            }
            const childSchema = schema[schemaKey]
              .__child as ObjectPropSchemaArrayChild;
            if (object[schemaKey].length > 0) {
              if (typeof object[schemaKey][0] === 'object') {
                if (childSchema.__type !== 'object') {
                  return {
                    ok: false,
                    error:
                      `${level}: Type mismatch at '${schemaKey}'.` +
                      ` Expected '${childSchema.__type}' but got 'object'.`,
                  };
                }
                for (let j = 0; j < object[schemaKey].length; j++) {
                  const result = objectUtility.compareWithSchema(
                    object[schemaKey][i],
                    childSchema.__content as ObjectSchema,
                    level + `.${schemaKey}`,
                  );
                  if (!result.ok) {
                    return result;
                  }
                }
              } else {
                for (let j = 0; j < object[schemaKey].length; j++) {
                  const item = object[schemaKey][j];
                  if (typeof item !== childSchema.__type) {
                    return {
                      ok: false,
                      error:
                        `${level}.${schemaKey}[${j}]: Type mismatch found in an` +
                        ` array '${schemaKey}'. Expected '${
                          childSchema.__type
                        }' but got a '${typeof item}'.`,
                    };
                  }
                }
              }
            }
          } else {
            return {
              ok: false,
              error:
                `${level}: Type mismatch of property '${schemaKey}'.` +
                ` Expected 'object.array' but got '${typeof object[
                  schemaKey
                ]}'.`,
            };
          }
        } else {
          if (typeof object[schemaKey] !== schema[schemaKey].__type) {
            return {
              ok: false,
              error: `${level}: Type mismatch of property '${schemaKey}'. Expected '${
                schema[schemaKey].__type
              }' but got '${typeof object[schemaKey]}'.`,
            };
          }
          if (schema[schemaKey].__type === 'object') {
            const result = objectUtility.compareWithSchema(
              object[schemaKey],
              schema[schemaKey].__child as ObjectSchema,
              level + `.${schemaKey}`,
            );
            if (!result.ok) {
              return result;
            }
          }
        }
      }
    }

    return {
      ok: true,
    };
  },
};

export function useObjectUtility() {
  return objectUtility;
}
