export interface GraphqlError {
  status: number;
  message: string;
  stack?: string[];
}

export const GraphqlErrorSchema = `
type GraphqlError {
  status: Int!
  message: String!
  stack: [String!]
}
`;
