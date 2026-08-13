import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("index.html", "utf8");
const dataScript = fs.readFileSync("data/sensitivity_data.js", "utf8");
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join("\n");

class Element {
  constructor(id = "") {
    this.id = id;
    this.innerHTML = "";
    this.textContent = "";
    this.value = "";
    this.selectedIndex = 0;
    this.dataset = {};
    this.options = [];
    this.classList = { add() {}, remove() {}, toggle() {} };
    this.style = {};
  }
  addEventListener() {}
  appendChild() {}
  remove() {}
  click() {}
}

const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, new Element(id));
  return elements.get(id);
}

const ids = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
ids.forEach(element);

const document = {
  getElementById: element,
  querySelectorAll() { return []; },
  querySelector() { return new Element(); },
  createElement() { return new Element(); },
  body: new Element("body"),
};

const context = {
  window: {},
  document,
  console,
  localStorage: {
    getItem() { return null; },
    setItem() {},
  },
  Blob: class Blob {},
  URL: {
    createObjectURL() { return "blob:test"; },
    revokeObjectURL() {},
  },
  Event: class Event {},
  scrollTo() {},
  setTimeout,
  clearTimeout,
};
context.window = context;

vm.createContext(context);
vm.runInContext(dataScript, context);
vm.runInContext(inline, context);
vm.runInContext(`
  render();
  Object.keys(views).forEach(setView);
  document.getElementById("diagnosis").value = "Community-acquired pneumonia";
  document.getElementById("severity").value = "Moderate";
  document.getElementById("setting").value = "Community-acquired";
  document.getElementById("egfr").value = "25";
  document.getElementById("allergy").value = "Penicillin allergy";
  document.getElementById("notes").value = "prior MDR";
  getRecommendation();
  if (!document.getElementById("recommendResult").innerHTML.includes("Guideline navigator")) throw new Error("Recommendation result missing");
  clearRecommendation();

  document.getElementById("doseDrug").value = "Azithromycin";
  document.getElementById("doseSyndrome").value = "Community-acquired pneumonia";
  document.getElementById("doseEgfr").value = "30-59";
  document.getElementById("doseWeight").value = "Standard adult";
  document.getElementById("doseSeverity").value = "OPD / mild";
  document.getElementById("doseCulture").value = "Pending";
  runDosingReview();
  if (!document.getElementById("doseReviewResult").innerHTML.includes("Common misuse pattern")) throw new Error("Dosing review misuse flag missing");
  clearDosingReview();

  openCaseLibrary();
  renderPatients();
  if (!document.getElementById("patientsBody").innerHTML.includes("CASE-05")) throw new Error("Tier-2 case missing");
  openModal("Study CASE-05", "Tier-2 OPD", renderCaseTrend("CASE-05"));
  if (!document.getElementById("modalBody").innerHTML.includes("azithromycin")) throw new Error("Case modal content missing");

  renderGuidelines();
  if (!document.getElementById("guidelinesList").innerHTML.includes("data-guideline")) throw new Error("Guideline buttons missing");
  renderLearning();
  if (!document.getElementById("learningGrid").innerHTML.includes("data-module")) throw new Error("Learning modules missing");
  renderDoseNotes();
  if (!document.getElementById("misusePatterns").innerHTML.includes("2-day antibiotic hopping")) throw new Error("Misuse pattern missing");
  exportReviewCases();
  downloadModuleCertificate(0);
  renderSensitivity();
`, context);

const matrix = element("sensitivityMatrixBody").innerHTML;
if (!matrix || !matrix.includes("sensitivity-cell")) {
  throw new Error("Sensitivity matrix did not render");
}
const requiredOutputs = [
  ["alertsList", "data-alert"],
  ["doseSafetyChecklist", "Confirm indication"],
  ["surveillanceMetrics", "Restricted starts"],
  ["learningGrid", "Antibiotic hopping in OPD practice"],
];
for (const [id, expected] of requiredOutputs) {
  if (!element(id).innerHTML.includes(expected)) {
    throw new Error(`${id} did not render expected content: ${expected}`);
  }
}
console.log("runtime validation ok");
process.exit(0);
