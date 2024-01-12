export type LocationType = 'new' | 'later' | 'archive' | 'feed' | 'shortlist' | undefined;
export type CategoryType = 'article' | 'email' | 'rss' | 'highlight' | 'note' | 'pdf' | 'epub' | 'tweet' | 'video' | undefined;

interface Tag {
    /** A tag used to organize documents in Readwise Reader. */
    name: string;
    type: string;
    created: number;
  }
  
export interface Document {
    /** A single document saved in the Readwise Reader. */
    id: string;
    url: string;
    title: string;
    author: string;
    source?: string;
    category: string;
    location: string;
    tags?: { [key: string]: Tag };
    siteName?: string;
    wordCount?: number;
    createdAt: string;
    updatedAt: string;
    publishedDate?: string;
    summary?: string;
    imageUrl?: string;
    content: any;
    sourceUrl: string;
}
  
export interface PostRequest {
    /** A POST request for the Readwise API to save documents to Reader. */
    url: string;
    html?: string;
    shouldCleanHtml?: boolean;
    title?: string;
    author?: string;
    summary?: string;
    publishedDate?: string;
    imageUrl?: string;
    location?: string;
    savedUsing?: string;
    tags?: string[];
}

export interface GetParameters {
    /** Parameters for GET requests */
    id?: string;
    location?: string;
    category?: string;
    updatedAfter?: string; // ISO 8601 date string
    pageCursor?: string;
}
  
export interface PostResponse {
    /** A response from the Readwise API for POST requests. */
    id: string;
    url: string;
}

export interface GetResponse {
    /** A response from the Readwise API for GET requests. */
    count: number;
    nextPageCursor?: string;
    results: Document[];
}

