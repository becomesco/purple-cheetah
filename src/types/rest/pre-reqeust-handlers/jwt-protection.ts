import type { JWT } from '../../modules';

export interface JWTPreRequestHandlerResult<Props> {
  accessToken: JWT<Props>;
}
