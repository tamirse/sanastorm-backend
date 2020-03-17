const express = require("express");
const db = require("./db");
const omorfiHandler = require("./omorfi_handler");

const app = express();
const port = 3000;

app.get("/api/sana/:word", (req, res) => {
  let word = req.params.word;

  const omorfiWordData = omorfiHandler.getWordData(word);

  // if omorfiWordData contains the word string, replace the word with it,
  // since omorfi gives us the word in Nominative or Infinitive form (that's good!)
  if (omorfiWordData.word !== null) {
    word = omorfiWordData.word;
  }

  // add CORS (cross-origin resource sharing) header
  const corsHeader = new Headers({
    "Access-Control-Allow-Origin": "*"
  });
  res.headers = corsHeader;

  db.getWordData(word)
    .then(wordData => {
      if (omorfiWordData.word !== null) {
        wordData["omorfi"] = omorfiWordData;
      }
      res.send(wordData);
    })
    .catch(e => res.send(e));
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
