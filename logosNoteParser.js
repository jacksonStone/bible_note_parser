const path = require('path');
const fs = require('fs');
const pathToNotes = './logos-notes.txt';
const note = fs.readFileSync(path.resolve(pathToNotes), 'utf8');
const books = ["Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalm",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation"];

const bookOfBibleIndex = (verseAsObj) => {
  const v = verseAsObj.s;
  let i = 0;
  for(let book of books) {
    if(v.toLowerCase().indexOf(book.toLowerCase()) !== -1) {
      return i; //one based
    }
    i++;
  }
  console.log("UNABLE TO FIND BOOK", verseAsObj.s);
  return i;
};



const entries = []
let c = 0
while (c < note.length) {
  while (c < note.length - 1) {
    if(note[c] === "S" && note[c+1] === ":") {
      //entry
      c+=2
      while(c < note.length && note[c] === " ") {
        c++;
      }
      let scripture = ''
      while(c < note.length && note[c] !== '\n') {
        scripture+=note[c]
        c++
      }
      c++
      // New line we are now to the body
      let body = ''
      let seekingNewline = false
      while(c < note.length) {
        body += note[c];
        if (c < note.length - 1 && note[c] === 'P' && note[c+1] === ':') {
          seekingNewline = true
        }
        c++
        if (seekingNewline && note[c] === '\n') {
          c++
          break;
        }
      }
      // Pushes to entries list
      entries.push({
        s: scripture,
        body
      })
    }
    c++
  }
  c++
}
let index = 1;
for (let i = entries.length - 1; i > -1; i--) {
  entries[i].index = index
  index++;
}
entries.sort((a, b) => {
  const bookAIndex = bookOfBibleIndex(a)
  const bookBIndex = bookOfBibleIndex(b)

  let [chaptera, versea] = a.s.substring(books[bookAIndex].length).trim().split(':');
  let [chapterb, verseb] = b.s.substring(books[bookBIndex].length).trim().split(':');
  versea = versea ? versea.trim() : '1'
  verseb = verseb ? verseb.trim() : '1'
  //
  a.s = `${books[bookAIndex]} ${chaptera}:${versea.split('-').map(s => s.trim()).join('-')}`
  b.s = `${books[bookBIndex]} ${chapterb}:${verseb.split('-').map(s => s.trim()).join('-')}`

  if(bookAIndex !== bookBIndex) return bookAIndex - bookBIndex;
  if(chaptera !== chapterb) return (chaptera|0) - (chapterb|0);
  return ((versea.split('-')[0])|0) - ((verseb.split('-')[0])|0);
});

let newDoc = ''
entries.map(v => {
  newDoc+=`
#${v.index}
${v.s}
- NOTE -
${v.body}
`;
});
fs.writeFileSync(path.resolve('./logosNotes.txt'), newDoc);
