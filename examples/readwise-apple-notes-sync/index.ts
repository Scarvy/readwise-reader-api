import {
  Readwise,
  ReadwiseBookHighlights,
  ReadwiseHighlight,
} from "readwise-reader-api";
import axios from "axios";
import applescript from "applescript";
import fs from "fs";
import path from "path";

const readwise = new Readwise({ auth: process.env.READWISE_TOKEN });

/**
 * Download content from a URL and save it to a temporary file.
 * 
 * @param url - The URL to download content from.
 * @returns The file path of the downloaded content.
 */
async function downloadContent(url: string) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const fileName = path.basename(url);
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, response.data);
  return filePath;
}

/**
 * Generate a metadata template for a book.
 * 
 * @param author - The author of the book.
 * @param title - The title of the book.
 * @param category - The category of the book.
 * @param bookTagsStr - The tags associated with the book.
 * @param url - The URL of the book.
 * @returns - The metadata template HTML string.
 */
function generateMetaDataTemplate(
  author: string,
  title: string,
  category: string,
  bookTagsStr: string,
  url: string,
) {
  return `<br><h1>Metadata</h1><ul><li>Author: ${author}</li><li>Full Title: ${title}</li><li>Category: ${category}</li><li>Document Tags: ${bookTagsStr}</li><li>URL: <a href=\\"${url}\\">${url}</a></li></ul>`;
}

/**
 * Generate a highlight template for a book.
 * 
 * @param highlight - The text of the highlight.
 * @param location - The location of the highlight.
 * @param note - The note associated with the highlight.
 * @param tags - The tags associated with the highlight.
 * @param url - The URL of the highlight.
 * @param attachmentPath - The file path of an attachment associated with the highlight.
 * @returns - The highlight template HTML string.
 */
function generateHighlightTemplate(
  highlight: string,
  location: string,
  note: string,
  tags: string,
  url: string,
  attachmentPath?: string,
) {
  if (attachmentPath) {
    const urlMatch = highlight.match(/!\[\]\((.*?)\)/);
    // take the highlight string and turn it into a link
    highlight = `<a href=\\"${urlMatch[1]}\\">${urlMatch[1]}</a>`;

    // Correctly escape the file path and build the HTML tag.
    const quotedAttachmentPath = attachmentPath.replace(/"/g, '\\"');
    highlight += `<br><img src=\\"file://${quotedAttachmentPath}\\">`;
    console.log("Highlight with attachment:", highlight);
  }

  // Ensure the entire string is escaped for AppleScript.
  return `${highlight}\n(Location <a href=\\"${url}\\">${location}</a>)<br><br><b>Note</b>: ${note}<br><b>Tags</b>: ${tags}<br>`;
}

/**
 * Export highlights from Readwise and write them to Apple Notes.
 * 
 * @param params - Parameters for exporting highlights.
 * @returns - An array of ReadwiseBookHighlights objects.
 */
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

/**
 * Sync highlights from Readwise to Apple Notes.
 * 
 * @param params - Parameters for exporting highlights.
 * @returns - An array of ReadwiseBookHighlights objects.
 */
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

/**
 * Write highlights to Apple Notes.
 * 
 * @param bookHighlights - An array of ReadwiseBookHighlights objects.
 * @returns - A promise that resolves when all highlights have been written.
 */
async function writeToAppleNotes(bookHighlights: ReadwiseBookHighlights[]) {
  for (const book of bookHighlights) {
    const highlights = book.highlights;
    console.log("Writing highlights for book:", book.title);
    for (const highlight of highlights) {
      try {
        console.log("Writing highlight:", "\t" + highlight.text + "\n");
        const appleScript = await buildAppleScripts(book, highlight);
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

/**
 * Construct an AppleScript command to create a note in Apple Notes.
 * 
 * @param book - The book associated with the highlight.
 * @param highlight - The highlight to create a note for.
 * @returns - The AppleScript command as a string.
 */
async function buildAppleScripts(
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

  // Check if the highlight contains an attachment
  let attachmentPath = "";
  if (highlight.text.includes("![]")) {
    // Extract the URL from the markdown image syntax
    const urlMatch = highlight.text.match(/!\[\]\((.*?)\)/);
    if (urlMatch && urlMatch[1]) {
      // Download the attachment and get the file path
      attachmentPath = await downloadContent(urlMatch[1]);
    }
  }

  const highlightBody = generateHighlightTemplate(
    cleanHighlightStr,
    cleanLocation,
    cleanNoteStr,
    highlightTagsStr,
    highlight.url,
    attachmentPath,
  );

  let appleScript = "";

  // Check if the note starts with ".h" header tag to indicate that it should be a header
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
  // Otherwise, add the highlight as a regular note
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

/**
 * Helper function to escape text for AppleScript.
 * 
 * @param text - The text to escape.
 * @returns - The escaped text.
 */
function _escape_for_applescript(text: string | number | null | undefined) {
  if (!text && text !== 0) return ""; // Handle undefined, null, or empty cases
  return text
    .toString()
    .replace(/"/g, '\\"')
    .replace(/'/g, "''")
    .replace(/\n/g, "<br>");
}

/**
 * Execute an AppleScript command.
 * 
 * @param script - The AppleScript command to execute.
 * @returns - A promise that resolves when the AppleScript command has been executed.
 */
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

// highlights updated in the 7 days
const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

interface ExportHighlightParameters {
  updatedAfter?: string; // Formatted as ISO 8601
  ids?: number[] | number | string; // Comma-separated list of book IDs
}

const params: ExportHighlightParameters = { updatedAfter: last7Days }
// const params: ExportHighlightParameters = { ids: [43077800] }

// Sync highlights from Readwise to Apple Notes
syncHighlights(params);
