/** Reader API Endpoints */

export const createReaderDocument = {
  method: "post",
  path: "/v3/save/",
  query: [
    "url",
    "html",
    "shouldCleanHtml",
    "title",
    "author",
    "summary",
    "publishedDate",
    "imageUrl",
    "location",
    "category",
    "savedUsing",
    "tags",
  ],
} as const;

export const listReaderDocument = {
  method: "get",
  path: "/v3/list/",
  query: ["id", "location", "category", "updatedAfter"],
} as const;

interface ReaderDocumentTag {
  /** A tag used to organize documents in Readwise Reader. */
  name: string;
  type: string;
  created: number;
}

export interface ReaderDocument {
  /** A single document saved in the Readwise Reader. */
  id: string;
  url: string;
  title: string;
  author: string;
  source?: string;
  category: string;
  location: string;
  tags?: Record<string, ReaderDocumentTag>;
  siteName?: string;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedDate?: string;
  summary?: string;
  imageUrl?: string;
  content: string;
  sourceUrl: string;
}

export interface CreateReaderDocumentParameters {
  /** A POST request for the Readwise API to save documents to Reader. */
  url: string;
  html?: string;
  shouldCleanHtml?: boolean;
  title?: string;
  author?: string;
  summary?: string;
  publishedDate?: string;
  imageUrl?: string;
  location?: "new" | "later" | "archive" | "feed";
  category?:
    | "article"
    | "email"
    | "rss"
    | "highlight"
    | "note"
    | "pdf"
    | "epub"
    | "tweet"
    | "video";
  savedUsing?: string;
  tags?: string[];
}

export interface ListReaderDocumentParameters {
  /** Parameters for GET requests */
  location?: string;
  category?: string;
  updatedAfter?: string; // ISO 8601 date string
  pageCursor?: string;
}

export interface CreateReaderDocumentResponse {
  /** A response from the Readwise API for POST requests. */
  id: string;
  url: string;
}

export interface ListReaderDocumentResponse {
  /** A response from the Readwise API for GET requests. */
  count: number;
  nextPageCursor?: string;
  results: ReaderDocument[];
}

export interface CreateReaderPostResponseBody {
  document_already_exists: boolean;
  data: CreateReaderDocumentResponse;
}

/** Readwise API Endpoints */

/** Highlight CREATE */

export const createHighlights = {
  method: "post",
  path: "/v2/highlights/",
  queryParams: [
    "text",
    "title",
    "author",
    "image_url",
    "source_url",
    "source_type",
    "category",
    "note",
    "location",
    "location_type",
    "highlighted_at",
    "highlighted_url",
  ],
} as const;

export interface CreateHighlightParameters {
  /** Parameters for POST request to create a HIGHLIGHT */
  text: string;
  title?: string;
  author?: string;
  image_url?: string;
  source_url?: string;
  source_type?: string;
  category?: string;
  note?: string;
  location?: number;
  location_type?: string;
  highlighted_at?: string;
  highlight_url?: string;
}

export interface NewHighlight {
  id: number;
  title: string;
  author: string;
  category: string;
  source: string;
  num_highlights: number;
  last_highlight_at: string | null;
  updated: string;
  cover_image_url: string;
  highlights_url: string;
  source_url: string | null;
  modified_highlights: number[];
}

export interface CreateHighlightsResponse {
  highlights: NewHighlight[];
}

/** Highlight EXPORT */

export const exportHighlights = {
  method: "get",
  path: "/v2/export/",
  queryParams: ["updatedAfter", "ids"],
} as const;

export interface ExportHighlightParameters {
  updatedAfter?: string; // Formatted as ISO 8601
  ids?: number[] | number | string; // Comma-separated list of book IDs
  pageCursor?: string
}

export interface ReadwiseHighlight {
  id: number;
  text: string;
  location: number;
  location_type: string;
  note: string | null;
  color: string;
  highlighted_at: string;
  created_at: string;
  updated_at: string;
  external_id: string;
  end_location: number | null;
  url: string | null;
  book_id: number;
  tags: Tag[];
  is_favorite?: boolean;
  is_discard?: boolean;
  readwise_url?: string;
}

export interface ReadwiseBookHighlights {
  user_book_id: number;
  title: string;
  author: string;
  readable_title: string;
  source: string;
  cover_image_url: string;
  unique_url: string;
  summary: string;
  book_tags: Tag[];
  category: string;
  document_note: string;
  readwise_url: string;
  source_url: string;
  asin: string | null;
  highlights: ReadwiseHighlight[];
}

export interface ExportHighlightsResponse {
  /** A response from the Readwise API for GET requests. */
  count: number;
  nextPageCursor?: string;
  results: ReadwiseBookHighlights[];
}

/** Highlight LIST */

export const listHighlights = {
  method: "get",
  path: "/v2/highlights/",
  query: [
    "page_size",
    "page",
    "book_id",
    "updated__lt",
    "updated__gt",
    "highlighted_at__lt",
    "highlighted_at__gt",
  ],
} as const;

export interface ListHighlightsParameters {
  page_size?: number;
  page?: number;
  book_id?: number;
  updated__lt?: string;
  updated__gt?: string;
  highlighted_at__lt?: string;
  highlighted_at__gt?: string;
}
interface Tag {
  id: number;
  name: string;
}
export interface ListHighlightsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReadwiseHighlight[];
}

/** Daily Review LIST */

export const listDailyReview = {
  method: "get",
  path: "/v2/review/",
} as const;

interface ReadwiseReviewHighlight {
  text: string;
  title: string;
  author: string;
  url: string | null;
  source_url: string | null;
  source_type: string;
  category: string | null;
  location_type: string;
  location: number;
  note: string;
  highlighted_at: string;
  highlight_url: string | null;
  image_url: string;
  id: number;
  api_source: string | null;
}

export interface GetDailyReviewResponse {
  review_id: number;
  review_url: string;
  review_completed: boolean;
  highlights: ReadwiseReviewHighlight[];
}

/** Book LIST */

export const listBooks = {
  method: "get",
  path: "/v2/books/",
  queryParams: [
    "page_size",
    "page",
    "category",
    "source",
    "num_highlights",
    "num_highlights__lt",
    "num_highlights__gt",
    "updated__lt",
    "updated__gt",
    "last_highlight_at__lt",
    "last_highlight_at__gt",
  ],
} as const;

export interface ListBooksParameters {
  page_size?: number;
  page?: number;
  category?: "books" | "articles" | "tweets" | "supplementals" | "podcasts";
  source?: string;
  num_highlights?: number;
  num_highlights__lt?: number;
  num_highlights__gt?: number;
  updated__lt?: string;
  updated__gt?: string;
  last_highlight_at__lt?: string;
  last_highlight_at__gt?: string;
}

export interface ReadwiseBook {
  id: number;
  title: string;
  author: string;
  category: string;
  source: string;
  num_highlights: number;
  last_highlight_at: string;
  updated: string;
  cover_image_url: string;
  highlights_url: string;
  source_url: string | null;
  asin: string;
  tags: string[];
  document_note: string;
}

export interface ListBooksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReadwiseBook[];
}

/** Book DETAILS */

export const detailsBooks = {
  method: "get",
  path: "/v2/books/",
} as const;

/** Reader API Types */
export type ReaderLocationType =
  | "new"
  | "later"
  | "archive"
  | "feed"
  | "shortlist"
  | undefined;
export type ReaderCategoryType =
  | "article"
  | "email"
  | "rss"
  | "highlight"
  | "note"
  | "pdf"
  | "epub"
  | "tweet"
  | "video"
  | undefined;

export type ReadwiseLibraryCategoryType =
  | "books"
  | "articles"
  | "tweets"
  | "supplementals"
  | "podcasts"
  | undefined;
