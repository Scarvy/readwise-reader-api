import axios from "axios";

import {
  ListHighlightsParameters,
  ListHighlightsResponse,
  ExportHighlightParameters,
  ExportHighlightsResponse,
  ReadwiseBookHighlights,
  exportHighlights,
  CreateHighlightParameters,
  CreateHighlightsResponse,
  GetDailyReviewResponse,
  ReadwiseBook,
  listDailyReview,
  listHighlights,
  listBooks,
  detailsBooks,
  ListBooksParameters,
  ListBooksResponse,
  ReadwiseHighlight,
} from "./api-endpoints";

import { ClientOptions, RequestParameters } from "./client";

/**
 * The Readwise class provides an interface to interact with the Readwise API,
 * allowing operations such as listing, creating, and exporting highlights,
 * as well as managing books and daily reviews.
 */
export default class Readwise {
  #auth?: string;
  #prefixUrl: string;

  /**
   * Initializes a new instance of the Readwise client.
   * @param options - Configuration options for the client, including authentication token and base URL.
   */
  public constructor(options?: ClientOptions) {
    this.#auth = options?.auth ?? process.env.READWISE_TOKEN;
    this.#prefixUrl = options?.baseUrl ?? "https://readwise.io/api";
  }

  /**
   * Generic request method to handle API calls to the Readwise service.
   * @param path - The API endpoint path.
   * @param method - The HTTP method to use for the request.
   * @param query - The query parameters to include in the request.
   * @param body - The body of the request for POST methods.
   * @returns A promise that resolves with the response body.
   * @template ResponseBody - The expected type of the response body.
   */
  public async request<ResponseBody>({
    path,
    method,
    query,
    body,
  }: RequestParameters): Promise<ResponseBody> {
    const urlString = `${this.#prefixUrl}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Token ${this.#auth}`,
    };

    if (body !== undefined) {
      headers["content-type"] = "application/json";
    }

    try {
      const response = await axios({
        method: method.toLocaleLowerCase(),
        url: urlString,
        headers: headers,
        params: query,
        data: body,
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        // Respect rate limiting
        const waitTime = parseInt(error.response.headers["Retry-After"]);
        await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
        return this.request({ path, method, query, body });
      } else {
        throw error;
      }
    }
  }

  /*
   * Readwise API endpoints
   */

  /**
   * A set of methods related to managing highlights through the Readwise API.
   */
  public readonly highlights = {
    /**
     * Creates new highlights in Readwise.
     * @param args - Parameters for highlight creation.
     * @returns A promise resolving with the response from the highlight creation endpoint.
     */
    create: (
      args: CreateHighlightParameters,
    ): Promise<CreateHighlightsResponse> => {
      return this.request<CreateHighlightsResponse>({
        path: listHighlights.path,
        method: listHighlights.method,
        query: args,
      });
    },

    /**
     * Lists highlights from Readwise.
     * @param args - Parameters for listing highlights, including pagination options.
     * @returns A promise resolving with an array of ReadwiseHighlight objects.
     */
    list: async (
      args: ListHighlightsParameters,
    ): Promise<ReadwiseHighlight[]> => {
      let results: ReadwiseHighlight[] = [];
      let currentPage = 1;
      let hasNextPage = false;

      do {
        try {
          const response = await this.request<ListHighlightsResponse>({
            path: listHighlights.path,
            method: listHighlights.method,
            query: { ...args, page: currentPage },
          });

          results = results.concat(response.results);
          hasNextPage = Boolean(response.next);
          currentPage++;
        } catch (error) {
          console.error("Error fetching highlights:", error);
          throw error;
        }
      } while (hasNextPage);
      return results;
    },

    /**
     * Exports highlights from Readwise.
     * @param args - Parameters for exporting highlights.
     * @returns A promise resolving with an array of ReadwiseBookHighlights objects.
     */
    export: async (
      args: ExportHighlightParameters,
    ): Promise<ReadwiseBookHighlights[]> => {
      let results: ReadwiseBookHighlights[] = [];
      let response: ExportHighlightsResponse;

      // if the book_ids are provided, turn the numbers into a comma-separated string
      if (args.ids && Array.isArray(args.ids)) {
        // turn the array of numbers into a comma-separated string
        args.ids = args.ids.join(",");
      }

      do {
        response = await this.request<ExportHighlightsResponse>({
          path: exportHighlights.path,
          method: exportHighlights.method,
          query: args,
        });
        results = results.concat(response.results);
        args.pageCursor = response.nextPageCursor;
      } while (response.nextPageCursor);
      return results;
    },
  };

  /**
   * A set of methods related to managing books through the Readwise API.
   */
  public readonly books = {
    /**
     * Lists books from Readwise with pagination support.
     * @param args - Parameters for listing books, including pagination options.
     * @returns A promise resolving with an array of ReadwiseBook objects.
     */
    list: async (args: ListBooksParameters): Promise<ReadwiseBook[]> => {
      let results: ReadwiseBook[] = [];
      let currentPage = 1;
      let hasNextPage = false;

      do {
        try {
          const response = await this.request<ListBooksResponse>({
            path: listBooks.path,
            method: listBooks.method,
            query: { ...args, page: currentPage },
          });

          results = results.concat(response.results);
          hasNextPage = Boolean(response.next); // Check if there is a 'next' page
          currentPage++; // Move to the next page
        } catch (error) {
          console.error("Error fetching books:", error);
          throw error; // Re-throw the error to handle it in the calling context
        }
      } while (hasNextPage);

      return results;
    },

    /**
     * Retrieves details of a single book from Readwise by its ID.
     * @param book_id - The unique identifier of the book.
     * @returns A promise resolving with the details of the ReadwiseBook.
     */
    details: (book_id: number): Promise<ReadwiseBook> => {
      return this.request({
        path: detailsBooks.path + `${book_id}/`,
        method: detailsBooks.method,
      });
    },
  };

  /**
   * Methods related to the daily review feature of Readwise.
   */
  public readonly review = {
    /**
     * Lists daily review highlights from Readwise.
     * @returns A promise resolving with the response from the daily review endpoint.
     */
    daily: (): Promise<GetDailyReviewResponse> => {
      return this.request<GetDailyReviewResponse>({
        path: listDailyReview.path,
        method: listDailyReview.method,
      });
    },
  };
}
