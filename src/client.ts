export interface ClientOptions {
  auth?: string;
  baseUrl?: string;
}

export interface RequestParameters {
  path: string;
  method: Method;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

/*
 * Type aliases to support the generic request interface.
 */
export type Method = "get" | "post" | "patch" | "delete";
