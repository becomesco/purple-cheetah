import {
  ControllerMethodPreRequestHandler,
  ObjectSchema,
  HTTPStatus,
  ObjectUtilityError,
} from '../../types';
import { useObjectUtility } from '../../util';

export function createBodyValidationPreRequestHandler<T>(
  schema: ObjectSchema,
): ControllerMethodPreRequestHandler<{ body: T }> {
  const objectUtil = useObjectUtility();

  return async ({ request, errorHandler }) => {
    const result = objectUtil.compareWithSchema(request.body, schema, 'body');
    if (result instanceof ObjectUtilityError) {
      throw errorHandler.occurred(HTTPStatus.BAD_REQUEST, result.message);
    }
    return { body: request.body };
  };
}
