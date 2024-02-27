const { Readwise } = require("../dist/index");
const { config } = require("dotenv");

config();
const readwise = new Readwise({ auth: process.env.READWISE_TOKEN });

async function testReadwiseClient() {
  console.log("Getting daily review highlights...");
  const daily_review = await readwise.review.daily();
  console.log(daily_review);

  console.log("Getting books...");
  const books = await readwise.books.list({ category: "books" });
  console.log(books);

  console.log("Exporting highlights...");
  const highlights = await readwise.highlights.export({
    updateAfter: "2024-01-27T00:00:00Z",
  });
  console.log(highlights);
}

testReadwiseClient();
