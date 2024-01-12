const { getDocuments, getDocumentById, saveDocument } = require('./dist/api');

async function testApi() {
  try {
    console.log('Getting documents...');
    const docs = await getDocuments('new', 'article', '2024-01-01T00:00:00Z');
    console.log(docs);

    console.log('Getting a specific document...');
    const doc = await getDocumentById('01hkwssvj7g207daxvk5k1tc4d');
    console.log(doc);

    console.log('Saving a document...');
    const saveResult = await saveDocument('https://example.com');
    console.log(saveResult);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

testApi();