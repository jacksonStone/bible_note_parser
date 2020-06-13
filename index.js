const path = require('path');
const fs = require('fs');
const pathToNotes = 'path/to/bible/notes/as/text';
const hasAddVerse = (c) => {
  return c.toLowerCase().includes('add verse') || c.toLowerCase().includes('addverse')
};
const bookOfBibleIndex = (verseAsObj) => {
  const v = verseAsObj.verse;
  let i = 0;
  for(let book of books) {
    if(v.toLowerCase().indexOf(book.toLowerCase()) !== -1) {
      return i+1; //one based
    }
    i++;
  }
  if(i === 0) {
    console.log("UNABLE TO FIND BOOK", verseAsObj.verse);
  }
  return i;
};
let newDoc = '';
fs.readdir(path.resolve(pathToNotes), function (err, files) {
  //handling error
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  let readFile = 0;
  let fileErrors = 0;
  const versesAsObj = [];
  const erroredOutVerses = [];
  const blurbMapping = {};
  files.forEach(function (file) {
    // Do whatever you want to do with the file
    const c = fs.readFileSync(path.join(pathToNotes, file), 'utf16le');
    if(!hasAddVerse(c)) {
      console.log("NO VERSE: " + readFile, file);
      // console.log(c);
      fileErrors++;
      erroredOutVerses.push(file);
      return;
    }
      let p = c.split('\n');
      const pWithoutBlanks = p.map(p=> {
        p = p.trim();
        if(p) {
          return p;
        }
        return '';
      }).filter(c => !!c);

      let verseAsJSON = {verse:'', verseRepeat: '', blurb: ''};
      let cancelLine = 0;
      for(let i in pWithoutBlanks) {
        if(pWithoutBlanks[i].toLowerCase().trim().indexOf('cancel') === 0) {
          //After the cancel
          cancelLine = i|0;
          break;
        }
      }

      verseAsJSON.verse = pWithoutBlanks[cancelLine + 1];
      if(!verseAsJSON.verse) {
        console.log("Unable to find Verse!");
        throw Error('BAD')
      }
      let startOfBlurb = 0;

      for(let i = cancelLine + 2; i < pWithoutBlanks.length; i++ ) {
        if (hasAddVerse(pWithoutBlanks[i])) {
          startOfBlurb = (i|0) + 1;
          break;
        }
        verseAsJSON.verseRepeat+=pWithoutBlanks[i];
      }
      const remainder = pWithoutBlanks.splice(startOfBlurb).join(' ');
      if(blurbMapping[remainder]) {
        console.log("Duplicate entry");
        return;
      } else {
        blurbMapping[remainder]=1;
      }
      verseAsJSON.blurb = remainder;
      if(!verseAsJSON.blurb) {
        console.log("Unable to find blurb!");
        throw Error('BAD')
      }
      verseAsJSON.name = file;


      versesAsObj.push(verseAsJSON);

    readFile++;
    // console.log(readFile++)
  });
  //Now created versesAsObj

  versesAsObj.sort((a, b) => {
    const comparison = bookOfBibleIndex(a) - bookOfBibleIndex(b);
    if(comparison) return comparison;
    //Same book
    const i = bookOfBibleIndex(a);
    const book = books[i - 1];
    let [chaptera, versea] = a.verse.substring(book.length).trim().split(':');
    let [chapterb, verseb] = b.verse.substring(book.length).trim().split(':');

    if(chaptera === chapterb) {
      versea = versea.split('ESV')[0].trim();
      verseb = verseb.split('ESV')[0].trim();

      let verseComp = ((versea.split('-')[0])|0) - ((verseb.split('-')[0])|0);
      return verseComp;
    }
    return (chaptera|0) - (chapterb|0);
  });
  versesAsObj.map((v, i) => v.index = i+1); //One based :)
  versesAsObj.map(v => {
    v.blurb = v.blurb.split('Drafts')[0].trim();
  });
  fs.writeFileSync(path.resolve('./blob.json'), JSON.stringify(versesAsObj));
  versesAsObj.map(v => {
    newDoc+=`
- ENTRY: ${v.index}, ${v.name};
${v.verse}
${v.verseRepeat}
-- NOTE: ${v.blurb}
`;
  });
  fs.writeFileSync(path.resolve('./blobAsText.txt'), newDoc);

  console.log("FILES WITH ERRORS: " + erroredOutVerses);
});


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
  "Psalms",
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
