import { Readwise } from "../dist/index";
import {
  ReadwiseBookHighlights,
  ReadwiseHighlight,
  ReadwiseBook,
  ReadwiseLibraryCategoryType,
} from "../dist/index";
import { config } from "dotenv";

config();
const readwise = new Readwise({ auth: process.env.READWISE_TOKEN });

/** Readwise Example Functions */

async function exportHighlights(updatedAfter?: string) {
  try {
    const highlights: ReadwiseBookHighlights[] =
      await readwise.highlights.export({
        updatedAfter: updatedAfter,
      });
    console.log(highlights);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function listHighlights(updatedAfter: string) {
  try {
    const highlights: ReadwiseHighlight[] = await readwise.highlights.list({
      highlighted_at__gt: updatedAfter,
    });
    console.log(highlights);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getBookDetails(book_id: string) {
  try {
    const book: ReadwiseBook = await readwise.books.details(book_id);
    console.log(book);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getBookHighlights(book_id: number) {
  try {
    const book_highlights: ReadwiseHighlight[] = await readwise.highlights.list(
      { book_id: book_id },
    );
    console.log(book_highlights);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function exportBookHighlights(book_id: number): Promise<void> {
  try {
    const highlights: ReadwiseBookHighlights[] =
      await readwise.highlights.export({ ids: book_id });
    console.log(highlights);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getArticleHighlights(category?: ReadwiseLibraryCategoryType) {
  const books: ReadwiseBook[] = await readwise.books.list({
    category: category,
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

async function getDailyReview() {
  /** Get Daily Review */
  try {
    const review = await readwise.review.daily();
    console.log(review);
  } catch (error) {
    console.error("Error:", error);
  }
}

exportHighlights();

exportHighlights("2024-01-27T00:00:00Z");

listHighlights("2024-01-27T00:00:00Z");

getBookDetails("35943114");

exportBookHighlights(35943114);

getBookHighlights(35943114);

getArticleHighlights("tweets");

getDailyReview();
