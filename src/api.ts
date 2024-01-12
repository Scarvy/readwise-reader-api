import axios from 'axios';
import { config } from 'dotenv';

import { Document, LocationType, CategoryType, GetParameters, GetResponse, PostRequest, PostResponse} from './types'

// Load environment variables
config();
const READWISE_TOKEN: string = process.env.READWISE_TOKEN || '';
if (!READWISE_TOKEN) {
  throw new Error('READWISE_TOKEN is not defined in the environment variables');
}
const URL_BASE: string = "https://readwise.io/api/v3";

// Function to handle GET request
async function makeGetRequest(params: GetParameters): Promise<GetResponse> {
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

export async function getDocuments(location?: LocationType, category?: CategoryType, updatedAfter?: string): Promise<Document[]> {
    let params: GetParameters = {};
    if (location) {
        params.location = location;
    }
    if (category) {
        params.category = category;
    }
    if (updatedAfter) {
        params.updatedAfter = updatedAfter;
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

