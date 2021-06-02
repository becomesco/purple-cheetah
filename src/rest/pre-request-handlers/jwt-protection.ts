import {
  ControllerPreRequestHandler,
  JWT,
  JWTPermissionName,
  JWTRoleName,
  HTTPStatus,
  JWTError,
} from '../../types';
import { useJwt } from '../../security';

export function createJwtProtectionPreRequestHandler<JWTCustomProps>(
  roles: JWTRoleName[],
  permission: JWTPermissionName,
): ControllerPreRequestHandler<{ accessToken: JWT<JWTCustomProps> }> {
  const jwt = useJwt();
  return async ({ request, errorHandler }) => {
    const accessToken = jwt.get<JWTCustomProps>({
      jwtString: request.headers.authorization as string,
      roleNames: roles,
      permissionName: permission,
    });
    if (accessToken instanceof JWTError) {
      throw errorHandler.occurred(HTTPStatus.UNAUTHORIZED, accessToken.message);
    }
    return { accessToken };
  };
}
