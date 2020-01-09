var exec = require("child_process").exec;

const DEV = true;

let cmd = "";
if (DEV) {
  cmd = "sh ";
}

// Verbs:
// UPOS=VERB
// Voice=Act
// VerbForm=Inf
// Person=3
// Number=Sing/Plur
// Case=Ill
// Tense=Past/Present
// Mood=Ind/Opt

// Non-verbs:
// UPOS=NOUN/PROPN/ADV/ADP/ADJ
// Number=Sing/Plur
// Case=Ill

const formatOutput = stdout => {
  let outputLines = stdout.split("\n").slice(3, -6);

  outputLines = outputLines.map(line => line.trim());

  let kaupunki = outputLines[3];

  console.log(outputLines);
  console.log(kaupunki.slice(" "));
};

exec(
  `${cmd}../omorfi/src/bash/omorfi-disambiguate-text.bash`,
  (error, stdout, stderr) => {
    formatOutput(stdout);
  }
);
