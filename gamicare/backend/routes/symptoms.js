const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const router = express.Router();

// Function to suggest doctor based on disease or symptoms
const getSuggestedDoctor = (disease, userSymptoms) => {
  const d = (disease || "").toLowerCase();
  const doctors = new Set();

  // Disease-based doctors
  if (d.match(/heart|cardio|arrhythmia|hypertension|cholesterol/)) doctors.add("Cardiologist");
  if (d.match(/lung|pneumonia|asthma|bronchitis|respiratory/)) doctors.add("Pulmonologist");
  if (d.match(/brain|headache|migraine|anxiety|panic|depression|neuropathy/)) doctors.add("Neurologist / Psychiatrist");
  if (d.match(/diabetes|insulin|glycemia/)) doctors.add("Endocrinologist");
  if (d.match(/skin|rash|dermatitis|eczema|psoriasis|infection of the skin/)) doctors.add("Dermatologist");
  if (d.match(/arthritis|joint|bone|fracture|osteoporosis/)) doctors.add("Orthopedic Surgeon");
  if (d.match(/glaucoma|vision|eye/)) doctors.add("Ophthalmologist");
  if (d.match(/ear|hearing|labyrinthitis|meniere/)) doctors.add("ENT Specialist");
  if (d.match(/throat|tonsil|laryngitis|vocal/)) doctors.add("ENT Specialist");
  if (d.match(/kidney|renal|hydronephrosis/)) doctors.add("Nephrologist / Urologist");
  if (d.match(/abdomen|stomach|digestive|liver|gastritis|ulcer/)) doctors.add("Gastroenterologist");
  if (d.match(/poisoning/)) doctors.add("Emergency Medicine / Toxicologist");

  // Symptom-based doctors
  const symptomMap = {
    "headache": "General Physician / Neurologist",
    "fever": "General Physician",
    "cough": "Pulmonologist / General Physician",
    "cold": "General Physician",
    "sore throat": "ENT Specialist / General Physician",
    "stomach pain": "Gastroenterologist / General Physician",
    "gastritis": "Gastroenterologist",
    "nausea": "Gastroenterologist / General Physician",
    "vomiting": "Gastroenterologist / General Physician",
    "diarrhea": "Gastroenterologist / General Physician",
    "rash": "Dermatologist",
    "itching": "Dermatologist",
    "dizziness": "Neurologist / General Physician",
    "palpitations": "Cardiologist / Neurologist",
    "fatigue": "General Physician",
    "back pain": "Orthopedic Surgeon / Physiotherapist",
    "joint pain": "Orthopedic Surgeon / Rheumatologist",
    "muscle pain": "Physiotherapist / Orthopedic Surgeon",
    "shortness of breath": "Pulmonologist / Cardiologist",
    "chest pain": "Cardiologist / General Physician",
    "anxiety": "Psychiatrist / Neurologist",
    "stress": "Psychiatrist / Neurologist"
  };

  for (let sym of userSymptoms) {
    for (let key in symptomMap) {
      if (sym.includes(key)) {
        symptomMap[key].split("/").forEach(doc => doctors.add(doc.trim()));
      }
    }
  }

  if (doctors.size === 0) return "General Physician";
  return Array.from(doctors).join(" / ");
};

// CSV file path
const filePath = path.join(__dirname, "..", "data", "Diseases_Symptoms.csv");

// POST route
router.post("/check", (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ message: "No symptoms provided" });

  const userSymptoms = input.toLowerCase().split(",").map(s => s.trim());

  let bestMatch = null;
  let highestScore = 0;
  let treatment = "Not Available";

  if (!fs.existsSync(filePath)) {
    return res.status(500).json({ message: "Diseases_Symptoms.csv file not found" });
  }

  // Robust CSV reading and matching
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      try {
        const csvSymptoms = row.Symptoms
          .split(",")
          .map(s => s.toLowerCase().trim())
          .filter(Boolean);

        const matchedSymptoms = userSymptoms.filter(sym => 
          csvSymptoms.some(csvSym => csvSym.includes(sym))
        );

        const score = matchedSymptoms.length;

        if (score > highestScore) {
          highestScore = score;
          bestMatch = row.Name;
          treatment = row.Treatments;
        }
      } catch (err) {
        console.error("CSV row parsing error:", err);
      }
    })
    .on("end", () => {
      const doctor = getSuggestedDoctor(bestMatch, userSymptoms);
      res.json({
        disease: bestMatch || "Unknown",
        treatment: treatment || "Not Available",
        doctor,
        matchScore: highestScore
      });
    })
    .on("error", (err) => {
      console.error("CSV read error:", err);
      res.status(500).json({ message: "Error reading disease data" });
    });
});

module.exports = router;
