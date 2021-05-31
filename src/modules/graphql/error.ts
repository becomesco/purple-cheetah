export interface GraphqlError {
  status: number;
  message: string;
  payloadBase64?: string;
}

export const GraphqlErrorSchema = `
type GraphQLError {
  status: Int!
  message: String!
  payloadBase64: String
}
`;
