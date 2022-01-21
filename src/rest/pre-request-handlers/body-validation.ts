import { ObjectSchema, ObjectUtilityError } from '@banez/object-utility/types';
import {
  ControllerMethodPreRequestHandler,
  HTTPStatus,
  BodyValidationPreRequestHandlerResult,
} from '../../types';
import { useObjectUtility } from '../../util';

/**
 * Creates a Controller pre request handler function for validating
 * request body using the Object Utility.
 */
export function createBodyValidationPreRequestHandler<T>(
  schema: ObjectSchema,
): ControllerMethodPreRequestHandler<BodyValidationPreRequestHandlerResult<T>> {
  const objectUtil = useObjectUtility();

  return async ({ request, errorHandler }) => {
    const result = objectUtil.compareWithSchema(request.body, schema, 'body');
    if (result instanceof ObjectUtilityError) {
      throw errorHandler.occurred(HTTPStatus.BAD_REQUEST, result.message);
    }
    return { body: request.body };
  };
}
