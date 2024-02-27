const { Client } = require("../dist/index");
const { config } = require("dotenv");

config();

const readwise = new Client({
  auth: process.env.READWISE_TOKEN,
});

const getDailyReview = async () => {
  const daily_review = await readwise.review.daily();
  console.log(daily_review);
};

const exportHighlights = async () => {
  const highlights = await readwise.highlights.export({
    updatedAfter: "2024-02-04T00:00:00Z",
  });
  console.log(highlights);
};

const exportBookHighlights = async () => {
  const highlights = await readwise.highlights.list({ book_id: 37170073 });
  console.log(highlights);
};

getDailyReview();

exportHighlights();

exportBookHighlights();
