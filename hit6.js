// HIT-6 style monthly check-in.
// NOTE: question wording below is a paraphrase written for this app, not the
// official licensed text. The scoring (6 items, 36-78) follows the standard method.

const HIT6_QUESTIONS = [
  "When you have headaches, how often is the pain severe?",
  "How often do headaches limit your ability to do usual daily activities, including household work, work, school or social activities?",
  "When you have a headache, how often do you wish you could lie down?",
  "In the past 4 weeks, how often have you felt too tired to do work or daily activities because of headaches?",
  "In the past 4 weeks, how often have you felt fed up or irritated because of headaches?",
  "In the past 4 weeks, how often did headaches limit your ability to concentrate on work or daily activities?",
];
const HIT6_OPTIONS = [
  { t: "Never", v: 6 }, { t: "Rarely", v: 8 }, { t: "Sometimes", v: 10 },
  { t: "Very often", v: 11 }, { t: "Always", v: 13 },
];
function hit6Score(values) { return values.reduce((a, b) => a + b, 0); }
function hit6Category(s) {
  if (s <= 49) return "Little or no impact";
  if (s <= 55) return "Some impact";
  if (s <= 59) return "Substantial impact";
  return "Severe impact";
}
