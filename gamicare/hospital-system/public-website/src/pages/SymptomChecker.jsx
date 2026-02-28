import { useState } from "react";
import axios from "axios";

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const checkSymptoms = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/symptoms/check", { input });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error checking symptoms");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto", padding: "20px", borderRadius: "10px", backgroundColor: "#e6f0ff" }}>
      <h2 style={{ textAlign: "center", color: "#3366ff" }}>Symptom Checker</h2>
      <input
        type="text"
        placeholder="Enter symptoms (comma separated)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #99ccff", marginTop: "10px" }}
      />
      <button onClick={checkSymptoms} style={{ width: "100%", marginTop: "15px", padding: "10px", borderRadius: "5px", border: "none", backgroundColor: "#3366ff", color: "#fff" }}>
        Check Symptoms
      </button>
      {result && (
        <div style={{ marginTop: "20px", color: "#333" }}>
          <p><b>Disease:</b> {result.disease}</p>
          <p><b>Treatment:</b> {result.treatment}</p>
          <p><b>Suggested Doctor:</b> {result.doctor}</p>
          <p><b>Match Score:</b> {result.matchScore}</p>
        </div>
      )}
    </div>
  );
}
