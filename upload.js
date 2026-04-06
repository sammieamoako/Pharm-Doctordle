const admin = require("firebase-admin");
const path = require("path");

// Hard-coding the path to be absolutely sure Node sees it
const serviceAccountPath = "C:\\Users\\sammi\\Downloads\\admin-key.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
});

const db = admin.firestore();

// Ensure the first case (2026-04-04) has an explanation now!
const casesToUpload = [
  {
    docId: "2026-04-05", // Yesterday
    case_id: 1,
    patient_profile: "68y/o Male with Chronic Heart Failure and Atrial Fibrillation.",
    presentation: "Patient reports seeing 'yellow-green halos' around lights and experiencing nausea/anorexia.",
    labs_diagnostics: "ECG shows 'Reverse Tick' ST-segment depression; K+ is 3.2 mEq/L (Hypokalemia).",
    correct_drug: "Digoxin",
    clean_drug: "digoxin",
    hint_mechanism: "Reversibly inhibits the Na+/K+-ATPase pump, increasing intracellular Calcium.",
    hint_clinical_pearl: "Narrow therapeutic index; toxicity is exacerbated by low potassium.",
    explanation: "Digoxin toxicity often presents with visual disturbances (Xanthopsia) and GI upset. Hypokalemia increases myocardial sensitivity to the drug. Ref: BNF Section 2.1.1 / NICE NG209."
  },
  {
    docId: "2026-04-06", // Today
    case_id: 2,
    patient_profile: "45y/o Female with newly diagnosed Hypertension and Type 2 Diabetes.",
    presentation: "Routine check-up; patient is asymptomatic but BP remains 158/94 mmHg over three readings.",
    labs_diagnostics: "Albumin-to-creatinine ratio (ACR) is elevated (35 mg/mmol), indicating microalbuminuria.",
    correct_drug: "Ramipril",
    clean_drug: "ramipril",
    hint_mechanism: "Competitively inhibits the Angiotensin-Converting Enzyme (ACE).",
    hint_clinical_pearl: "Renoprotective in diabetic nephropathy; monitor for dry cough.",
    explanation: "ACE inhibitors are first-line for hypertensive diabetics due to their ability to reduce efferent arteriolar resistance in the kidney. Ref: NICE NG136 / ADA Standards of Care."
  },
  {
    docId: "2026-04-07",
    case_id: 3,
    patient_profile: "52y/o Male with Type 2 Diabetes (BMI: 34).",
    presentation: "HbA1c is 8.5% despite lifestyle changes. Patient is concerned about weight gain.",
    labs_diagnostics: "eGFR: 55 mL/min/1.73m² (Mildly decreased).",
    correct_drug: "Metformin",
    clean_drug: "metformin",
    hint_mechanism: "Activates AMP-activated protein kinase (AMPK), reducing hepatic gluconeogenesis.",
    hint_clinical_pearl: "Does not cause hypoglycemia or weight gain; high risk of GI side effects.",
    explanation: "Metformin remains the gold-standard first-line therapy for T2DM, particularly in overweight patients. Ref: BNF Section 6.1.2.2."
  },
  {
    docId: "2026-04-08",
    case_id: 4,
    patient_profile: "30y/o Female complaining of heat intolerance, palpitations, and weight loss.",
    presentation: "Physical exam shows a fine tremor and a visible goiter.",
    labs_diagnostics: "TSH < 0.01 mIU/L; Free T4 is significantly elevated.",
    correct_drug: "Carbimazole",
    clean_drug: "carbimazole",
    hint_mechanism: "Inhibits the enzyme thyroid peroxidase, preventing iodine organification.",
    hint_clinical_pearl: "Rare but serious side effect of agranulocytosis (sore throat/fever).",
    explanation: "Carbimazole is a pro-drug for methimazole and is used to manage hyperthyroidism (Graves' Disease). Ref: BNF Section 6.2.2."
  },
  {
    docId: "2026-04-09",
    case_id: 5,
    patient_profile: "24y/o Female with painful urination and increased frequency.",
    presentation: "Suprapubic pain but no fever or flank pain (Uncomplicated Cystitis).",
    labs_diagnostics: "Urine dipstick positive for Nitrites and Leucocytes.",
    correct_drug: "Trimethoprim",
    clean_drug: "trimethoprim",
    hint_mechanism: "Inhibits bacterial dihydrofolate reductase.",
    hint_clinical_pearl: "Often combined with Sulfamethoxazole; avoid in first trimester of pregnancy.",
    explanation: "Trimethoprim is frequently used as a first-line agent for uncomplicated UTIs in non-pregnant women. Ref: NICE NG109."
  },
  {
    docId: "2026-04-10",
    case_id: 6,
    patient_profile: "70y/o Male hospitalized for Community-Acquired Pneumonia.",
    presentation: "Productive cough with 'rusty' sputum; confusion (CURB-65 score: 3).",
    labs_diagnostics: "Chest X-ray shows right lower lobe consolidation.",
    correct_drug: "Amoxicillin",
    clean_drug: "amoxicillin",
    hint_mechanism: "Beta-lactam antibiotic that inhibits cell wall synthesis (PBP binding).",
    hint_clinical_pearl: "Standard narrow-spectrum choice for S. pneumoniae; high resistance in some areas.",
    explanation: "High-dose Amoxicillin is a staple for CAP management due to its efficacy against Streptococcus pneumoniae. Ref: BNF Section 5.1.1.1."
  },
  {
    docId: "2026-04-11",
    case_id: 7,
    patient_profile: "75y/o Male with Parkinson’s Disease (Stage 3).",
    presentation: "Increasing 'on-off' fluctuations and bradykinesia.",
    labs_diagnostics: "Normal renal and hepatic function.",
    correct_drug: "Levodopa",
    clean_drug: "levodopa",
    hint_mechanism: "A dopamine precursor that crosses the blood-brain barrier.",
    hint_clinical_pearl: "Always co-administered with a dopa-decarboxylase inhibitor (like Carbidopa).",
    explanation: "Levodopa remains the most effective drug for managing motor symptoms of Parkinson's. Ref: NICE NG71."
  },
  {
    docId: "2026-04-12",
    case_id: 8,
    patient_profile: "19y/o Male with a history of Tonic-Clonic seizures.",
    presentation: "Patient presents to the pharmacy with swollen, bleeding gums (Gingival Hyperplasia).",
    labs_diagnostics: "Drug plasma levels are 25 mcg/mL (Toxic range: >20).",
    correct_drug: "Phenytoin",
    clean_drug: "phenytoin",
    hint_mechanism: "Blocks voltage-gated Sodium channels in the 'inactive' state.",
    hint_clinical_pearl: "Exhibits zero-order (saturation) kinetics at higher doses.",
    explanation: "Phenytoin is notorious for gingival hyperplasia and its non-linear pharmacokinetics. Ref: BNF Section 4.8.1."
  },
  {
    docId: "2026-04-13",
    case_id: 9,
    patient_profile: "34y/o Female with chronic heartburn and acid reflux.",
    presentation: "Reports 'sour taste' in mouth and epigastric pain despite using antacids.",
    labs_diagnostics: "H. pylori urea breath test is negative.",
    correct_drug: "Omeprazole",
    clean_drug: "omeprazole",
    hint_mechanism: "Irreversibly inhibits the H+/K+-ATPase pump in gastric parietal cells.",
    hint_clinical_pearl: "Long-term use associated with B12 deficiency and increased risk of C. diff.",
    explanation: "PPIs are highly effective for GERD and peptic ulcer disease but require counseling on long-term risks. Ref: BNF Section 1.3.5."
  },
  {
    docId: "2026-04-14",
    case_id: 10,
    patient_profile: "12y/o Boy with known Asthma.",
    presentation: "Mother reports he uses his 'blue inhaler' every single day; he has frequent nighttime waking.",
    labs_diagnostics: "Peak expiratory flow (PEF) is 75% of predicted.",
    correct_drug: "Salbutamol",
    clean_drug: "salbutamol",
    hint_mechanism: "Short-acting Beta-2 Agonist (SABA) causing rapid bronchodilation.",
    hint_clinical_pearl: "Over-reliance (>3 canisters/year) is linked to increased asthma mortality.",
    explanation: "While Salbutamol provides rapid relief, frequent use indicates poor control and the need for an ICS. Ref: GINA Guidelines 2024."
  }
];

async function startUpload() {
  console.log("Attempting Clinical Data Sync...");
  try {
    // Test the connection first with a simple check
    const collections = await db.listCollections();
    console.log("📡 Connection established to Firebase.");

    for (const item of casesToUpload) {
      const { docId, ...data } = item;
      await db.collection("cases").doc(docId).set(data);
      console.log(`✅ Success: ${docId}`);
    }
    console.log("🚀 All Clinical Cases Live!");
  } catch (error) {
    console.error("❌ CLASSIFIED ERROR:", error.message);
    if (error.message.includes("UNAUTHENTICATED")) {
      console.log("\n💡 DIAGNOSIS: Your Service Account is likely DISABLED in Google Cloud Console.");
      console.log("Go to: https://console.cloud.google.com/iam-admin/serviceaccounts and click ENABLE.");
    }
  }
}

startUpload();

