export interface GraphqlError {
  status: number;
  message: string;
  stack?: string[];
}

export const GraphqlErrorSchema = `
type GraphQLError {
  status: Int!
  message: String!
  stack: [String!]
}
`;
