export class DefaultObjects {
  public static get all() {
    return [this.string, this.float];
  }

  public static string = `
  type StringResponse {
    error: ResponseError
    edge: String
  }
  `;
  public static float = `
  type FloatResponse {
    error: ResponseError
    edge: Float
  }
  `;
}
