var child_process = require("child_process");

const SCRIPT_PATH = "../omorfi/src/bash/omorfi-disambiguate-text.sh";

/**
 * Maps the UPOS codes to a more readable string
 * @param {string} uposCode
 */
const mapUposCodeToReadable = uposCode => {
  switch (uposCode) {
    case "VERB":
      return "verb";
    case "NOUN":
      return "noun";
    case "PROPN":
      return "proper noun";
    case "ADV":
      return "adverb";
    case "ADP":
      return "adposition";
    case "ADJ":
      return "adjective";
    case "AUX":
      return "auxiliary verb";
    case "CONJ":
      return "coordinating conjunction";
    case "DET":
      return "determiner";
    case "SCONJ":
      return "subordinating conjunction";
    case "PUNCT":
      return "punctuation";
    case "SYM":
      return "symbol";
    case "PRON":
      return "pronoun";
    default:
      break;
  }
};

/**
 * formats the omorfi-disambiguate-text script
 * stdout to a readable object
 * @param {string} stdout
 */
const formatOutput = stdout => {
  let outputLines = stdout.split("\n").slice(0, -7); // split and remove redundant rows
  outputLines = outputLines.map(line => line.trim()); // remove edge whitespaces

  // TODO handle all lines, not only 1
  return lineToObject(outputLines[1]);
};

/**
 * format a single omorfi-disambiguate-text script
 * stdout line string to a readable object
 *
 * example for such line: "kaupunki" UPOS=NOUN Number=Sing Case=Nom <CMP=1> <W=0>
 * @param {string} line
 */
const lineToObject = line => {
  line = line.split(" "); // turn to array
  line = line.slice(0, -2); // remove 'CMP' and 'W'

  let lineObject = { word: null };

  // parse array to object
  line.map(e => {
    let keyValArray = e.split("="); // example: e is "UPOS=VERB"

    let key = keyValArray[0]; // example: key = "UPOS"
    let value = keyValArray[1]; // example: value = "VERB"

    if (value === undefined) {
      // TODO handle case where word has # inside

      // value is undefined when key is the word itself
      lineObject["word"] = key.substring(1, key.length - 1); // remove double quotes
    } else if (key === "UPOS") {
      lineObject[key] = mapUposCodeToReadable(value);
    } else {
      lineObject[key] = value;
    }
  });

  return lineObject;
};

/**
 * returns data object in the following format:
 * {
 *  name: [the word, in NOM or INF],
 *  UPOS: [VERB/NOUN/PROPN/...]
 *  Case: [Nom/Gen/...],
 *  Number: [Sing/Plur],
 *  Person: [1/2/3]
 *  Tense: [Present/Past]
 *  Mood: [Ind/Opt/???]
 * }
 *
 * @param {string} word
 */
const getWordData = word => {
  let resultChild = null;

  try {
    resultChild = child_process.spawnSync(SCRIPT_PATH, {
      input: word
    });
  } catch (error) {
    console.log(error);
  }

  return formatOutput(resultChild.stdout.toString());
};

module.exports = {
  getWordData: getWordData
};
