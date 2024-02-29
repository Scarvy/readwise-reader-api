# An unofficial Readwise & Reader SDK for JavaScript

This client provides a convenient way to interact with the Readwise & Reader API, suitable for both JavaScript and TypeScript applications.

## Installation

```bash
npm install readwise-reader-api
```

## Usage

### Prerequisites

1. Obtain a Readwise API token [here](https://readwise.io/access_token)
2. Store in .env file or in an environment variable.

```bash
export READWISE_TOKEN=<api_token>
```

Import and initialize a client (`Readwise` or `Reader`) using an access token.

```javascript
const { Readwise } = require("readwise-reader-api");

const readwise = new Readwise({
  auth: process.env.READWISE_TOKEN,
});
```

Make a request to any Readwise (or Reader) API endpoint.

> See the complete list of endpoints in the API Reference:
>
> - [Readwise](https://readwise.io/api_deets)
> - [Readwise Reader](https://readwise.io/reader_api)

```javascript
(async () => {
  const daily_review = await readwise.review.daily();
})();
```

Each method returns a `Promise` which resolves the response.

```javascript
console.log(daily_review);
```

```bash
{
  review_id: 104932226,
  review_url: 'https://readwise.io/reviews/104932226',
  review_completed: true,
  highlights: [
    {
      text: '“If it walks like a duck and it quacks like a duck, then it must be a duck.”',
      title: 'Practices of the Python Pro',
      author: 'Dane Hillard',
      url: null,
      source_url: 'https://read.readwise.io/read/01h65f61js5qpaycd1409e22qw',
      source_type: 'article',
      category: null,
      location_type: 'offset',
      location: 78999682,
      note: '',
      highlighted_at: '2023-09-17T15:46:42.883825Z',
      highlight_url: 'https://read.readwise.io/read/01hahx56818mje85sga832j5t2',
      image_url: 'https://readwise-assets.s3.amazonaws.com/static/images/article0.00998d930354.png',
      id: 597114893,
      api_source: null
    },
    ...
    {
      text: 'we continue along this rate of change and follow a “Large Model Moore’s Law,” then these far-fetched scenarios may just enter the realm of the possible.',
      title: 'Generative AI: A Creative New World',
      author: 'Sonya Huang',
      url: null,
      source_url: 'https://read.readwise.io/read/01h6qabyzghazrt1qsjvf9zeqa',
      source_type: 'article',
      category: null,
      location_type: 'offset',
      location: 21926,
      note: '',
      highlighted_at: '2023-08-04T15:17:58.196413Z',
      highlight_url: 'https://read.readwise.io/read/01h70j0xryxnwm3b6wcf4n6kfh',
      image_url: 'https://www.sequoiacap.com/wp-content/uploads/sites/6/2022/09/robots-1-1960.jpg',
      id: 574654751,
      api_source: null
    },
  ]
}
```

## Client Library References

A reference for all methods and types available in Readwise and Reader Client libraries.

### Readwise

**EXPORT Highlights**: Export all highlights after a specific date.

```typescript
async function exportHighlights() {
  try {
    const highlights: ReadwiseBookHighlights[] =
      await readwise.highlights.export({
        updatedAfter: "2024-01-27T00:00:00Z",
      });
    console.log(highlights);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

**LIST Highlights**: List all highlights after a specific date.

```typescript
async function listHighlights() {
  try {
    const highlights: ReadwiseHighlight[] = await readwise.highlights.list({
      highlighted_at__gt: "2024-01-27T00:00:00Z",
    });
    console.log(highlights);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

**DAILY REVIEW:** Returns your daily review highlights.

```typescript
async function getDailyReview() {
  /** Get Daily Review */
  try {
    const review = await readwise.review.daily();
    console.log(review);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

**DETAILS Book:** Get details for a book (eg Article, Blog, Tweet, Book, etc.).

```typescript
async function getBookDetails() {
  try {
    const book: ReadwiseBook = await readwise.books.details({
      book_id: "35943114",
    });
    console.log(book);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

**LIST Highlights (in Book):** Get all highlights for a single book (eg Article, Blog, Tweet, Book, etc.).

```typescript
async function getBookHighlights() {
  try {
    const book_highlights: ReadwiseHighlight[] = await readwise.highlights.list(
      { book_id: 35943114 },
    );
    console.log(book_highlights);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

**EXPORT Highlights (in Book):** Export all highlights for a single book (eg Article, Blog, Tweet, Book, etc.).

```typescript
async function exportBookHighlights(): Promise<void> {
  try {
    const highlights: ReadwiseBookHighlights[] =
      await readwise.highlights.export({ ids: 35943114 });
    console.log(highlights);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

### Advanced Usage

Get all highlights for a particular category (eg "Tweets")

```typescript
async function getHighlightsFromTweets() {
  const books: ReadwiseBook[] = await readwise.books.list({
    category: "tweets",
  });
  for (const book of books) {
    const highlights = await readwise.highlights.list({ book_id: book.id });
    if (highlights.length > 0) {
      console.log(book.title);
      for (const highlight of highlights) {
        console.log(highlight.text);
      }
    }
  }
}
```

### Readwise Reader

Provides the ability to create, list, and retrieve documents.

```typescript
import { Reader } from "readwise-reader-api";

const reader = new Reader({
  auth: process.env.READWISE_TOKEN,
});
```

**CREATE Document:** Create a document.

```typescript
const result = await reader.document.create({
  url: url,
  title: "New Title",
});
```

The response will show if document already exists or not.

```bash
{
  document_already_exists: true,
  data: {
    id: '01hqeecsxa5qx6beyjvbrz37e4',
    url: 'https://read.readwise.io/read/01hqeecsxa5qx6beyjvbrz37e4'
  }
}
```

**LIST Documents:** List documents for a specific *location*, *category* and/or *date*.

```typescript
async function listReaderDocuments() {
  try {
    console.log("Getting documents...");
    const docs = await reader.document.list(
      "new",
      "article",
      "2024-01-01T00:00:00Z",
    );
    console.log(docs);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

**GET Document by ID:** Retrieve a single document.

```typescript
async function getReaderDocument() {
  try {
    console.log("Getting a specific document...");
    const doc = await reader.document.id("01hkwssvj7g207daxvk5k1tc4d");
    console.log(doc);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

### Available Readwise and Reader Types

```typescript
export {
  /** Readwise */
  ReadwiseBook,
  ReadwiseBookHighlights,
  ReadwiseHighlight,
  ReadwiseLibraryCategoryType,
  /** Reader */
  ReaderDocument,
  ReaderLocationType,
  ReaderCategoryType,
} from "./api-endpoints";
```

Check documentation for more details.
