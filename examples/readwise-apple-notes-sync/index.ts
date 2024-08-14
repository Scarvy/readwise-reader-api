import {
  Readwise,
  ReadwiseBookHighlights,
  ReadwiseHighlight,
} from "readwise-reader-api";
import applescript from "applescript";

const readwise = new Readwise({ auth: process.env.READWISE_TOKEN });

function generateMetaDataTemplate(
  author: string,
  title: string,
  category: string,
  bookTagsStr: string,
  url: string,
) {
  return `<br><h1>Metadata</h1><ul><li>Author: ${author}</li><li>Full Title: ${title}</li><li>Category: ${category}</li><li>Document Tags: ${bookTagsStr}</li><li>URL: <a href=\\"${url}\\">${url}</a></li></ul>`;
}

function generateHighlightTemplate(
  highlight: string,
  location: string,
  note: string,
  tags: string,
  url: string,
) {
  return `${highlight} (Location <a href=\\"${url}\\">${location}</a>)" & "<br><br>" & "<b>Note</b>: ${note}" & "<br>" & "<b>Tags</b>: ${tags}" & "<br>`;
}

const exportHighlights = async (params: ExportHighlightParameters) => {
  try {
    const highlights = await readwise.highlights.export({
      ...params,
    });
    return highlights;
  } catch (error) {
    console.error("Error exporting highlights:", error);
    return [];
  }
};

const syncHighlights = async (params: ExportHighlightParameters) => {
  console.log("Syncing highlights...");

  console.log(
    "Updated After:",
    params.updatedAfter
      ? params.updatedAfter
      : "No date specified. Syncing all highlights.",
  );

  const bookHighlights = await exportHighlights(params);

  if (bookHighlights.length === 0) {
    console.log("No new highlights to sync");
    return;
  } else {
    // write to Apple Notes
    try {
      await writeToAppleNotes(bookHighlights);
    } catch (error) {
      console.error("Error writing to Apple Notes:", error);
    }
  }
};

async function writeToAppleNotes(bookHighlights: ReadwiseBookHighlights[]) {
  for (const book of bookHighlights) {
    const highlights = book.highlights;
    console.log("Writing highlights for book:", book.title);
    for (const highlight of highlights) {
      try {
        console.log("Writing highlight:", "\t" + highlight.text + "\n");
        const appleScript = buildAppleScripts(book, highlight);
        console.log(appleScript);

        try {
          await runAppleScript(appleScript);
        } catch (error) {
          console.error("Error running AppleScript:", error);
        }
      } catch (error) {
        console.error("Error building AppleScript command:", error);
        return;
      }
    }
  }
}

function buildAppleScripts(
  book: ReadwiseBookHighlights,
  highlight: ReadwiseHighlight,
) {
  console.log("Building AppleScript for highlight:", highlight);

  const cleanHighlightStr = _escape_for_applescript(highlight.text);
  const cleanNoteStr = _escape_for_applescript(highlight.note);

  const highlightTagsStr = highlight.tags.map((tag) => tag.name).join(", ");
  const bookTagsStr = book.book_tags.map((tag) => tag.name).join(", ");

  const metadataBody = generateMetaDataTemplate(
    book.author,
    book.title,
    book.category,
    bookTagsStr,
    book.source_url,
  );

  // Location is a number, but we need to convert it to a string unless it is undefined
  const cleanLocation = highlight.location ? highlight.location.toString() : "";

  const highlightBody = generateHighlightTemplate(
    cleanHighlightStr,
    cleanLocation,
    cleanNoteStr,
    highlightTagsStr,
    highlight.url,
  );

  let appleScript = "";

  if (highlight.note?.startsWith(".h")) {
    appleScript = `
            tell application "Notes"
              set folderName to "Readwise"
              set theFolder to missing value
              repeat with eachFolder in folders
                if name of eachFolder is folderName then
                  set theFolder to eachFolder
                  exit repeat
                end if
              end repeat
              if theFolder is missing value then
                set theFolder to (make new folder with properties {name:folderName})
              end if
              set theNote to missing value
              repeat with eachNote in (notes of theFolder)
                if name of eachNote is "${book.readable_title}" then
                  set theNote to eachNote
                  exit repeat
                end if
              end repeat
              if theNote is not missing value then
                set the body of theNote to the body of theNote & "<br>" & "<h2>${cleanHighlightStr}</h2>"
              else
                make new note at theFolder with properties {name:"${book.readable_title}", body:"${metadataBody}<br><h1>Highlights</h1><br>${cleanHighlightStr}"}
              end if
            end tell
          `;
  } else {
    appleScript = `
            tell application "Notes"
              set folderName to "Readwise"
              set theFolder to missing value
              repeat with eachFolder in folders
                if name of eachFolder is folderName then
                  set theFolder to eachFolder
                  exit repeat
                end if
              end repeat
              if theFolder is missing value then
                set theFolder to (make new folder with properties {name:folderName})
              end if
              set theNote to missing value
              repeat with eachNote in (notes of theFolder)
                if name of eachNote is "${book.readable_title}" then
                  set theNote to eachNote
                  exit repeat
                end if
              end repeat
              if theNote is not missing value then
                set the body of theNote to the body of theNote & "<br>" & "${highlightBody}"
              else
                make new note at theFolder with properties {name:"${book.readable_title}", body:"${metadataBody}<br><h1>Highlights</h1><br>${highlightBody}"}
              end if
            end tell
          `;
  }

  console.log(appleScript);

  return appleScript;
}

function _escape_for_applescript(text: string | number | null | undefined) {
  if (!text && text !== 0) return ""; // Handle undefined, null, or empty cases
  return text
    .toString()
    .replace(/"/g, '\\"')
    .replace(/'/g, "''")
    .replace(/\n/g, "<br>");
}

const runAppleScript = async (script: string) => {
  return new Promise((resolve, reject) => {
    applescript.execString(script, (err, result) => {
      if (err) {
        console.error("Error running AppleScript:", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// 7 days ago
const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

// last month
// const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

// yesterday
// const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

interface ExportHighlightParameters {
  updatedAfter?: string; // Formatted as ISO 8601
  ids?: number[] | number | string; // Comma-separated list of book IDs
}

const params: ExportHighlightParameters = { updatedAfter: last7Days };

syncHighlights(params);