import axios from "axios";
import {
  listReaderDocument,
  createReaderDocument,
  ListReaderDocumentParameters,
  ListReaderDocumentResponse,
  CreateReaderDocumentParameters,
  ReaderDocument,
  CreateReaderPostResponseBody,
} from "./api-endpoints";
import { ClientOptions, RequestParameters } from "./client";

/**
 * A class for interacting with Reader API endpoints, providing methods to create, list, and retrieve documents.
 */
export default class Reader {
  #auth?: string;
  #prefixUrl: string;

  /**
   * Constructs a new Reader instance with optional client options.
   * @param options - Configuration options for the Reader client including authentication token and base URL.
   */
  public constructor(options?: ClientOptions) {
    this.#auth = options?.auth ?? process.env.READWISE_TOKEN;
    this.#prefixUrl = options?.baseUrl ?? "https://readwise.io/api";
  }

  /**
   * Makes HTTP requests to the Reader API with provided request parameters.
   * @param params - The request parameters including path, method, query parameters, and body.
   * @returns The axios response object.
   * @private
   */
  private async makeRequest({
    path,
    method = "get",
    query,
    body,
  }: RequestParameters): Promise<any> {
    const urlString = `${this.#prefixUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Token ${this.#auth}`,
      ...(body && { "Content-Type": "application/json" }),
    };

    try {
      const response = await axios({
        method: method,
        url: urlString,
        headers: headers,
        params: query,
        data: body,
      });
      return response;
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        const waitTime = parseInt(error.response.headers["Retry-After"]);
        await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
        return this.makeRequest({ path, method, query, body });
      } else {
        throw error;
      }
    }
  }

  /**
   * Performs a GET request to the Reader API.
   * @param path - The endpoint path.
   * @param query - The query parameters for the request.
   * @param body - The request body.
   * @returns The response body from the GET request.
   * @template ResponseBody - The expected type of the response body.
   */
  public async get_request<ResponseBody>({
    path,
    query,
    body,
  }: RequestParameters): Promise<ResponseBody> {
    const response = await this.makeRequest({
      path,
      method: "get",
      query,
      body,
    });
    return response.data;
  }

  /**
   * Performs a POST request to the Reader API.
   * @param path - The endpoint path.
   * @param query - The query parameters for the request.
   * @param body - The request body.
   * @returns An object indicating if the document already exists and the response data.
   */
  public async post_request({
    path,
    query,
    body,
  }: RequestParameters): Promise<CreateReaderPostResponseBody> {
    const response = await this.makeRequest({
      path,
      method: "post",
      query,
      body,
    });
    return {
      document_already_exists: response.status === 200,
      data: response.data,
    };
  }

  /**
   * Provides methods for managing documents in the Reader, including
   * creating, listing, and retrieving documents by ID.
   */
  public readonly document = {
    /**
     * Creates a new document in the Reader.
     * @param params - The parameters required to create the document.
     * @returns An object indicating if the document already exists and the response data.
     */
    create: (
      params: CreateReaderDocumentParameters,
    ): Promise<CreateReaderPostResponseBody> => {
      return this.post_request({
        path: createReaderDocument.path,
        method: "post",
        body: params,
      });
    },

    /**
     * Lists documents in the Reader.
     * @param location - The document location.
     * @param category - The document category.
     * @param updatedAfter - The timestamp for filtering documents updated after a certain date.
     * @returns An array of ReaderDocument objects.
     */
    list: async (
      location?: string,
      category?: string,
      updatedAfter?: string,
    ): Promise<ReaderDocument[]> => {
      let params: ListReaderDocumentParameters = {};
      if (location) params.location = location;
      if (category) params.category = category;
      if (updatedAfter) params.updatedAfter = updatedAfter;

      let results: ReaderDocument[] = [];
      let response: ListReaderDocumentResponse;

      do {
        response = await this.get_request<ListReaderDocumentResponse>({
          path: listReaderDocument.path,
          method: "get",
          query: params,
        });
        results = results.concat(response.results);
        params.pageCursor = response.nextPageCursor;
      } while (response.nextPageCursor);

      return results;
    },

    /**
     * Retrieves a document by its ID.
     * @param id - The unique identifier of the document.
     * @returns The ReaderDocument if found, or null.
     */
    id: async (id: string): Promise<ReaderDocument | null> => {
      const response = await this.get_request<ListReaderDocumentResponse>({
        path: listReaderDocument.path,
        method: "get",
        query: { id: id },
      });
      return response.count === 1 ? response.results[0] : null;
    },
  };
}
