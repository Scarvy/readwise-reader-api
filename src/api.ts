import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();
const READWISE_TOKEN: string = process.env.READWISE_TOKEN || '';
if (!READWISE_TOKEN) {
  throw new Error('READWISE_TOKEN is not defined in the environment variables');
}
const URL_BASE: string = "https://readwise.io/api/v3";

interface Tag {
    /** A tag used to organize documents in Readwise Reader. */
    name: string;
    type: string;
    created: number;
  }
  
interface Document {
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
  
interface GetResponse {
    /** A response from the Readwise API for GET requests. */
    count: number;
    nextPageCursor?: string;
    results: Document[];
}
  
interface PostRequest {
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
  
interface PostResponse {
    /** A response from the Readwise API for POST requests. */
    id: string;
    url: string;
}
  
interface GetDocumentParams {
    /** Parameters for GET requests */
    id?: string;
    location?: string;
    category?: string;
    pageCursor?: string;
}

// Function to handle GET request
async function makeGetRequest(params: GetDocumentParams): Promise<GetResponse> {
  try {
    const response = await axios.get<GetResponse>(`${URL_BASE}/list/`, {
      headers: { Authorization: `Token ${READWISE_TOKEN}` },
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      // Respect rate limiting
      const waitTime = parseInt(error.response.headers['Retry-After']);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      return makeGetRequest(params);
    } else {
      throw error;
    }
  }
}

// Function to handle POST request
async function makePostRequest(payload: PostRequest): Promise<[boolean, PostResponse]> {
  try {
    const response = await axios.post<PostResponse>(`${URL_BASE}/save/`, payload, {
      headers: { Authorization: `Token ${READWISE_TOKEN}` },
    });
    return [response.status === 200, response.data];
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      // Respect rate limiting
      const waitTime = parseInt(error.response.headers['Retry-After']);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      return makePostRequest(payload);
    } else {
      throw error;
    }
  }
}

export async function getDocuments(location: string, category?: string): Promise<Document[]> {
    if (!['new', 'later', 'shortlist', 'archive', 'feed'].includes(location)) {
        throw new Error(`Invalid location: ${location}`);
    }
    
    let params: any = { location: location };
    if (category) {
        params.category = category;
    }

    let results: Document[] = [];
    let response: GetResponse;
    
    do {
        response = await makeGetRequest(params);
        results = results.concat(response.results);
        params.pageCursor = response.nextPageCursor;
    } while (response.nextPageCursor);

    return results;
}

export async function getDocumentById(id: string): Promise<Document | null> {
    const response = await makeGetRequest({ id: id });
    
    if (response.count === 1) {
        return response.results[0];
    } else {
        return null;
    }
}

export async function saveDocument(url: string): Promise<[boolean, PostResponse]> {
    return makePostRequest({ url: url });
}

