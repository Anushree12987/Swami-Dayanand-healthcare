const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const router = express.Router();

const User = require("../models/User");

// Function to suggest specializations based on disease or symptoms
const getSuggestedSpecializations = (disease, userSymptoms) => {
  const d = (disease || "").toLowerCase();
  const specializations = new Set();

  // Disease-based mapping
  if (d.match(/heart|cardio|arrhythmia|hypertension|cholesterol/)) specializations.add("Cardiology");
  if (d.match(/lung|pneumonia|asthma|bronchitis|respiratory/)) specializations.add("General Medicine"); // Or Pulmonology if added
  if (d.match(/brain|headache|migraine|neuropathy/)) specializations.add("Neurology");
  if (d.match(/anxiety|panic|depression|stress/)) specializations.add("Psychiatry");
  if (d.match(/diabetes|insulin|glycemia/)) specializations.add("General Medicine");
  if (d.match(/skin|rash|dermatitis|eczema|psoriasis|infection of the skin/)) specializations.add("Dermatology");
  if (d.match(/arthritis|joint|bone|fracture|osteoporosis/)) specializations.add("Orthopedics");
  if (d.match(/glaucoma|vision|eye/)) specializations.add("General Medicine"); // Or Ophthalmology
  if (d.match(/ear|hearing|throat|tonsil|laryngitis/)) specializations.add("General Medicine"); // Or ENT
  if (d.match(/kidney|renal|hydronephrosis/)) specializations.add("General Medicine");
  if (d.match(/abdomen|stomach|digestive|liver|gastritis|ulcer/)) specializations.add("General Medicine"); // Or Gastroenterology
  if (d.match(/child|pediatric|infant/)) specializations.add("Pediatrics");
  if (d.match(/women|pregnancy|gyneco/)) specializations.add("Gynecology");

  // Symptom-based mapping
  const symptomMap = {
    "headache": ["Neurology", "General Medicine"],
    "fever": ["General Medicine"],
    "cough": ["General Medicine"],
    "cold": ["General Medicine"],
    "sore throat": ["General Medicine"],
    "stomach pain": ["General Medicine"],
    "gastritis": ["General Medicine"],
    "nausea": ["General Medicine"],
    "rash": ["Dermatology"],
    "itching": ["Dermatology"],
    "dizziness": ["Neurology", "General Medicine"],
    "palpitations": ["Cardiology"],
    "chest pain": ["Cardiology", "General Medicine"],
    "anxiety": ["Psychiatry"],
    "stress": ["Psychiatry"],
    "joint pain": ["Orthopedics"],
    "back pain": ["Orthopedics"],
    "tooth": ["Dentistry"],
    "gum": ["Dentistry"]
  };

  for (let sym of userSymptoms) {
    for (let key in symptomMap) {
      if (sym.includes(key)) {
        symptomMap[key].forEach(spec => specializations.add(spec));
      }
    }
  }

  if (specializations.size === 0) return ["General Medicine"];
  return Array.from(specializations);
};

// CSV file path
const filePath = path.join(__dirname, "..", "data", "Diseases_Symptoms.csv");

// POST route
router.post("/check", async (req, res) => {
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
    .on("end", async () => {
      const suggestedSpecs = getSuggestedSpecializations(bestMatch, userSymptoms);
      
      try {
        // Fetch real doctors from the database
        const recommendedDoctors = await User.find({
          role: 'doctor',
          specialization: { $in: suggestedSpecs },
          isActive: true
        }).select('name specialization rating experience profilePicture phone email');

        res.json({
          disease: bestMatch || "Unknown",
          treatment: treatment || "Not Available",
          specializations: suggestedSpecs,
          recommendedDoctors,
          matchScore: highestScore
        });
      } catch (dbErr) {
        console.error("Database error fetching doctors:", dbErr);
        res.status(500).json({ message: "Error fetching recommended doctors" });
      }
    })
    .on("error", (err) => {
      console.error("CSV read error:", err);
      res.status(500).json({ message: "Error reading disease data" });
    });
});

module.exports = router;
