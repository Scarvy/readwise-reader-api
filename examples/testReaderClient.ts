import { Reader } from "../dist/index";
import { config } from "dotenv";

config();
const reader = new Reader({ auth: process.env.READWISE_TOKEN });

/** Reader Example Functions */

async function listReaderDocuments(
  location?: string,
  category?: string,
  updatedAfter?: string,
) {
  try {
    console.log("Getting documents...");
    const reader_docs = await reader.document.list(
      location,
      category,
      updatedAfter,
    );
    console.log(reader_docs);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getReaderDocument(document_id: string) {
  try {
    console.log("Getting a specific document...");
    const doc = await reader.document.id(document_id);
    console.log(doc);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function createReaderDocument(url: string) {
  try {
    console.log("Saving a document...");
    const saveResult = await reader.document.create({
      url: url,
      title: "New Title",
    });
    if (saveResult.document_already_exists === true)
      console.log("Document already exists.");
    console.log(saveResult);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

listReaderDocuments("new", "article", "2024-01-01T00:00:00Z");

getReaderDocument("01hkwssvj7g207daxvk5k1tc4d");

createReaderDocument("https://example.com");
