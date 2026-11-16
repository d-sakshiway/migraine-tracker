// Static configuration: pain scale, symptoms, triggers, daily questions.
// Edit the text here to change wording everywhere (form, report key, CSV legend).

const PAIN = [
  { n: 1, t: "Barely there, I'd forget it if I were busy" },
  { n: 2, t: "Mild ache, easy to ignore" },
  { n: 3, t: "Noticeable but doesn't stop me doing anything" },
  { n: 4, t: "Distracting, I can still work or function" },
  { n: 5, t: "Hard to ignore, concentration is suffering" },
  { n: 6, t: "Need to slow down, light or sound makes it worse" },
  { n: 7, t: "Can't work properly, I want to lie down in the dark" },
  { n: 8, t: "Severe, struggling to talk or think, usually with nausea" },
  { n: 9, t: "Intense, can barely move, nothing helps" },
  { n: 10, t: "Worst pain imaginable, I'd go to the ER" },
];

// 1-3 mild, 4-6 moderate, 7-8 severe, 9-10 very severe
function painBand(n) { return n <= 3 ? 1 : n <= 6 ? 2 : n <= 8 ? 3 : 4; }
const BAND_COLORS = { 1: "#f2d45c", 2: "#f0a14a", 3: "#d4574a", 4: "#9a1b2f" };
const BAND_NAMES = { 1: "Mild (1-3)", 2: "Moderate (4-6)", 3: "Severe (7-8)", 4: "Very severe (9-10)" };
function painColor(n) { return BAND_COLORS[painBand(n)]; }

// d = definition shown in the doctor report key (only where the label needs explaining)
const SYMPTOM_GROUPS = [
  { name: "Head and face", items: [
    { l: "Left side head" }, { l: "Right side head" }, { l: "Back of head" },
    { l: "Forehead" }, { l: "Top of head" },
    { l: "Throbbing/pulsing" },
    { l: "Pressure behind the eyes" },
    { l: "Forehead pressure", d: "A heavy, pressing feeling on the forehead that does not go away" },
    { l: "Facial bone/muscle pain" },
    { l: "Tense jaw" },
    { l: "Side nerve pain (L)", d: "Pain along the nerve running from the side of the head, through the ear, down to the throat, on the left side" },
    { l: "Side nerve pain (R)", d: "Same as above, on the right side" },
    { l: "Scalp tenderness" },
  ]},
  { name: "Neck, shoulders and arms", items: [
    { l: "Neck stiffness" }, { l: "Shoulder stiffness" },
    { l: "Left shoulder pain" }, { l: "Right shoulder pain" },
    { l: "Left arm pain" }, { l: "Right arm pain" },
  ]},
  { name: "Sensory", items: [
    { l: "Light sensitivity" }, { l: "Sound sensitivity" }, { l: "Smell sensitivity" },
    { l: "Aura", d: "Visual zigzags, flashing lights or blind spots before or during the attack" },
    { l: "Blurred vision" },
  ]},
  { name: "Body", items: [
    { l: "Nausea" }, { l: "Vomiting" }, { l: "Dizziness" }, { l: "Fatigue" },
    { l: "Cold hands" }, { l: "Sweating" },
    { l: "Sudden heat/flushing", d: "A sudden wave of heat or flushing, like a hot flash" },
  ]},
  { name: "Mind and mood", items: [
    { l: "Brain fog" }, { l: "Trouble finding words" }, { l: "Irritable" }, { l: "Low mood" },
    { l: "Emotionally drained", d: "Annoyed, close to tears, or emotionally done" },
    { l: "Trouble concentrating" },
  ]},
  { name: "Other", items: [
    { l: "Pre-attack yawning/cravings", d: "Yawning or food cravings before the pain starts (prodrome)" },
    { l: "Weather sensitivity" },
  ]},
];

const TRIGGERS = ["Stress", "Skipped meal", "Long screen time", "Strong smell",
  "Weather change", "Alcohol", "Caffeine", "Poor sleep"];

// Yes/no questions. k = field name, label = shown in form, key = meaning shown in report/CSV legend
const QUESTIONS = [
  { k: "sleepRecorded", label: "Did you record your sleep today?",
    key: "Whether sleep was recorded that day (e.g. in a health app)" },
  { k: "extraSleep", label: "Did you sleep extra (naps or more than the night's sleep)?",
    key: "Extra sleep that day, such as naps or sleeping more than the night sleep" },
  { k: "hungerPain", label: "Did you experience any pain because of hunger today?",
    key: "Pain that day that the patient attributes to hunger / missed meal" },
  { k: "travelled", label: "Did you travel outside town recently?",
    key: "Recent travel outside the home town" },
  { k: "heavyLift", label: "Did you lift anything heavy today?",
    help: "Laptop counts. Anything around 1 L of water or heavier counts.",
    key: "Lifted something heavy that day (a laptop, or anything around 1 L of water or heavier)" },
  { k: "workout", label: "Did you walk or work out today?",
    key: "Any walk or workout that day" },
  { k: "stopped", label: "Did it stop you from doing things?",
    key: "The attack stopped the patient from doing normal activities" },
];
