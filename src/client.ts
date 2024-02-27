export interface ClientOptions {
  auth?: string;
  baseUrl?: string;
}

export interface RequestParameters {
  path: string;
  method: Method;
  query?: any;
  body?: any;
}

/*
 * Type aliases to support the generic request interface.
 */
export type Method = "get" | "post" | "patch" | "delete";
