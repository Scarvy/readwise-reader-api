# An unoffical JavaScript/TypeScript Client for the Readwise Reader API Client

An unofficial client for interacting with the Readwise Reader API, suitable for both JavaScript and TypeScript applications.

## Installation

```bash
npm install readwise-reader-api
```

## Usage

### JavaScript

```javascript
const { getDocuments, getDocumentById, saveDocument } = require('readwise-reader-api');

// Fetch Documents
getDocuments('new')
  .then(documents => console.log(documents))
  .catch(error => console.error('Error:', error));

// Fetch a Specific Document by ID
getDocumentById('document_id')
  .then(document => console.log(document))
  .catch(error => console.error('Error:', error));

// Save a New Document
saveDocument('http://example.com')
  .then(([success, response]) => console.log(success, response))
  .catch(error => console.error('Error:', error));
```

### TypeScript

```typescript
import { getDocuments, getDocumentById, saveDocument, Document, PostResponse } from 'readwise-reader-api';

// Fetch Documents
async function fetchDocuments(): Promise<void> {
    try {
        const documents: Document[] = await getDocuments('new');
        console.log(documents);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Fetch a Specific Document by ID
async function fetchDocumentById(): Promise<void> {
    try {
        const document: Document | null = await getDocumentById('document_id');
        console.log(document);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Save a New Document
async function saveNewDocument(): Promise<void> {
    try {
        const [success, response]: [boolean, PostResponse] = await saveDocument('http://example.com');
        console.log(success, response);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## API Reference

- `getDocuments(location: string, category?: string): Promise<Document[]>`
- `getDocumentById(id: string): Promise<Document | null>`
- `saveDocument(url: string): Promise<[boolean, PostResponse]>`

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

This project is licensed under the ISC License.
