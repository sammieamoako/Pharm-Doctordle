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
    "date": "2026-04-10",
    "patient_profile": "30yo Female. PMH: Panic Disorder (diagnosed 2 months ago). No history of substance abuse.",
    "presentation": "The patient reports experiencing 3-4 'out of the blue' panic attacks per week for the last month. She describes a constant state of 'anticipatory anxiety'—a persistent fear of when the next attack will occur. She is seeking a sustainable, long-term pharmacological strategy to reduce the overall frequency of these episodes.",
    "labs_diagnostics": "Physical Exam: Normal. TSH: 1.2 mIU/L (to rule out hyperthyroidism). EKG: Normal Sinus Rhythm.",
    "hint_mechanism": "Selective Serotonin Reuptake Inhibitor (SSRI): Increases synaptic serotonin levels to modulate the amygdala's 'fear response' over time.",
    "hint_clinical_pearl": "Johnson Pearl: While benzodiazepines provide rapid relief for an active attack, they do not treat the underlying disorder. SSRIs are the gold standard for long-term prevention.",
    "correct_drug": "Sertraline",
    "clean_drug": "sertraline",
    "explanation": "For long-term management of Panic Disorder, SSRIs are first-line. They provide continuous prophylaxis against attacks and treat anticipatory anxiety, whereas anxiolytics (like Benzodiazepines) are reserved only for short-term 'bridging' or acute rescue.",
    "reference": "WFSBP Guidelines for Anxiety Disorders 2025."
  },
  {
    "date": "2026-04-11",
    "patient_profile": "45yo Female. PMH: Asthma (Moderate Persistent). Recent URI 1 week ago.",
    "presentation": "Presents with increased wheezing and cough, especially at night. Currently using SABA 4 times daily. PEFR is 70% of personal best. Seeking long-term control.",
    "labs_diagnostics": "FExNO: 45 ppb. Pulse Ox: 96% on RA. Chest X-ray: Clear.",
    "hint_mechanism": "Inhaled Corticosteroid (ICS): Reduces airway inflammation by inhibiting multiple inflammatory cytokines.",
    "hint_clinical_pearl": "Johnson Pearl: ICS is the cornerstone of maintenance; SABA overuse (>2 canisters/year) is a risk factor for exacerbation.",
    "correct_drug": "Fluticasone",
    "clean_drug": "fluticasone",
    "explanation": "Per GINA 2025 guidelines, persistent symptoms require a step-up to daily controller therapy to prevent remodeling.",
    "reference": "GINA 2025 Global Strategy for Asthma Management."
  },
  {
    "date": "2026-04-12",
    "patient_profile": "68yo Male. PMH: HFrEF (LVEF 30%), HTN, Type 2 DM.",
    "presentation": "Stable but remains symptomatic (NYHA Class II) on Lisinopril and Carvedilol. BP: 118/74, HR: 68.",
    "labs_diagnostics": "NT-proBNP: 1200 pg/mL. Serum K+: 4.1 mEq/L. CrCl: 55 mL/min.",
    "hint_mechanism": "ARNI: Inhibits neprilysin to increase natriuretic peptides while blocking the AT1 receptor.",
    "hint_clinical_pearl": "Johnson Pearl: Requires a 36-hour washout period when switching from an ACE inhibitor to avoid angioedema.",
    "correct_drug": "Sacubitril/Valsartan",
    "clean_drug": "sacubitril/valsartan",
    "explanation": "ARNI therapy is preferred over ACEI/ARB for NYHA Class II-IV HFrEF to further reduce mortality.",
    "reference": "ACC/AHA HF Guidelines Update 2026."
  },
  {
    "date": "2026-04-13",
    "patient_profile": "55yo Female. PMH: New onset Type 2 DM. A1c: 8.4%. BMI: 31.",
    "presentation": "Asymptomatic. No history of ASCVD or CKD. Goal is glycemic control and weight management.",
    "labs_diagnostics": "FBG: 165 mg/dL. SCr: 0.9. LFTs: Normal.",
    "hint_mechanism": "Biguanide: Decreases hepatic glucose production and improves insulin sensitivity.",
    "hint_clinical_pearl": "Johnson Pearl: Titrate slowly to minimize GI upset (nausea/diarrhea). Hold for 48h after IV contrast.",
    "correct_drug": "Metformin",
    "clean_drug": "metformin",
    "explanation": "Metformin remains first-line for T2DM without specific high-risk cardiovascular or renal comorbidities.",
    "reference": "ADA Standards of Care 2026."
  },
  {
    "date": "2026-04-14",
    "patient_profile": "72yo Female. PMH: Atrial Fibrillation (non-valvular), HTN.",
    "presentation": "Recent diagnosis of Afib. CHA2DS2-VASc score is 4. Patient prefers oral therapy over injections.",
    "labs_diagnostics": "SCr: 1.2 (CrCl 45 mL/min). Hgb: 13.5.",
    "hint_mechanism": "Direct Factor Xa Inhibitor: Blocks the site of Factor Xa, inhibiting thrombin generation.",
    "hint_clinical_pearl": "Johnson Pearl: Superior to Warfarin for stroke prevention with lower intracranial bleed risk.",
    "correct_drug": "Apixaban",
    "clean_drug": "apixaban",
    "explanation": "DOACs are first-line for stroke prevention in Afib. Apixaban has favorable profile in elderly and renal moderate impairment.",
    "reference": "AHA/ACC Afib Guidelines 2025."
  },

  {
    "date": "2026-04-15",
    "patient_profile": "30yo Male. PMH: Epilepsy (Tonic-Clonic). Planning for international travel.",
    "presentation": "Experienced a breakthrough seizure after missing 2 doses due to stomach flu. Needs a drug with well-established therapeutic ranges.",
    "labs_diagnostics": "Trough drug level: 8 mcg/mL (Reference: 10-20 mcg/mL). Albumin: 4.2 g/dL.",
    "hint_mechanism": "Voltage-gated Sodium Channel Inactivator: Prolongs the inactive state of the channel to stop high-frequency firing.",
    "hint_clinical_pearl": "Johnson Pearl: Exhibit Michaelis-Menten kinetics; small dose changes can cause large changes in serum level. Monitor for gingival hyperplasia.",
    "correct_drug": "Phenytoin",
    "clean_drug": "phenytoin",
    "explanation": "Phenytoin requires careful monitoring due to non-linear kinetics. For the PhD study, this tests knowledge of narrow therapeutic index (NTI) drugs.",
    "reference": "Epilepsy Foundation Clinical Guidelines 2025."
  },
  {
    "date": "2026-04-16",
    "patient_profile": "50yo Male. PMH: Chronic Gout, HTN. Diet high in purines.",
    "presentation": "Presents with acute flare in the left knee. Already taking Allopurinol 300mg daily. Goal: Immediate pain and inflammation reduction.",
    "labs_diagnostics": "Joint aspirate: Monosodium urate crystals. CrCl: 75 mL/min.",
    "hint_mechanism": "Antimitotic: Disrupts cytoskeletal microtubules in neutrophils to inhibit migration to inflamed joints.",
    "hint_clinical_pearl": "Johnson Pearl: Dosing for acute flare is 1.2mg followed by 0.6mg in 1 hour. Prophylactic dosing is 0.6mg daily.",
    "correct_drug": "Colchicine",
    "clean_drug": "colchicine",
    "explanation": "Colchicine is first-line for acute flares when started within 36 hours of symptom onset.",
    "reference": "ACR Guidelines for Gout Management 2025."
  },
  {
    "date": "2026-04-17",
    "patient_profile": "60yo Female. PMH: Osteoporosis, GERD. Lives in an assisted living facility.",
    "presentation": "Recent DEXA T-score: -2.8 (Lumbar spine). History of wrist fracture. Needs first-line oral therapy.",
    "labs_diagnostics": "Calcium: 9.4. Vitamin D: 32 ng/mL. SCr: 1.0.",
    "hint_mechanism": "Bisphosphonate: Inhibits osteoclast-mediated bone resorption by binding to hydroxyapatite.",
    "hint_clinical_pearl": "Johnson Pearl: Must stay upright for 30 min after taking with plain water to avoid esophageal irritation.",
    "correct_drug": "Alendronate",
    "clean_drug": "alendronate",
    "explanation": "Alendronate is the standard first-line for postmenopausal osteoporosis to reduce fracture risk.",
    "reference": "Endocrine Society Osteoporosis Guidelines 2025."
  },
  {
    "date": "2026-04-18",
    "patient_profile": "25yo Female. PMH: None. Presents with sudden urinary frequency.",
    "presentation": "Presents with dysuria, urgency, and frequency for 2 days. No fever, chills, or flank pain. Goal: Empiric treatment for uncomplicated UTI.",
    "labs_diagnostics": "UA: (+) Nitrites, (+) Leukocyte Esterase. Pregnancy Test: Negative.",
    "hint_mechanism": "Bacterial Cell Wall Synthesis Inhibitor: Inactivates or alters bacterial ribosomal proteins and other macromolecules.",
    "hint_clinical_pearl": "Johnson Pearl: Highly concentrated in the bladder; ineffective for pyelonephritis due to poor tissue penetration.",
    "correct_drug": "Nitrofurantoin",
    "clean_drug": "nitrofurantoin",
    "explanation": "Nitrofurantoin is the preferred first-line agent for uncomplicated cystitis due to low resistance rates.",
    "reference": "IDSA Guidelines for Uncomplicated UTI 2025."
  },
  {
    "date": "2026-04-19",
    "patient_profile": "58yo Male. PMH: Depression. Has difficulty falling asleep due to 'racing thoughts'.",
    "presentation": "Initiating therapy for major depressive disorder. Complains of secondary insomnia. Needs an SSRI with a long half-life.",
    "labs_diagnostics": "PHQ-9 Score: 19. Liver Function: Normal.",
    "hint_mechanism": "SSRI: Selectively inhibits the reuptake of serotonin in the synaptic cleft.",
    "hint_clinical_pearl": "Johnson Pearl: Often stimulating; should be taken in the morning. Long half-life reduces withdrawal symptoms if a dose is missed.",
    "correct_drug": "Fluoxetine",
    "clean_drug": "fluoxetine",
    "explanation": "Fluoxetine is unique among SSRIs for its 4-6 day half-life, which acts as a 'self-taper'.",
    "reference": "APA Clinical Practice Guidelines for Depression 2025."
  },
  {
    "date": "2026-04-20",
    "patient_profile": "40yo Male. PMH: Hyperlipidemia. Smoker (1 pack/day). BMI: 28.",
    "presentation": "Wants to quit smoking. Has tried nicotine patches and gums without success. Goal: Most effective monotherapy for cessation.",
    "labs_diagnostics": "Heart Rate: 72 bpm. BP: 124/80 mmHg.",
    "hint_mechanism": "Partial Nicotinic Acetylcholine Receptor Agonist: Mimics dopamine release while blocking nicotine binding.",
    "hint_clinical_pearl": "Johnson Pearl: Start 1 week before the 'quit date'. Advise patient about potential vivid dreams.",
    "correct_drug": "Varenicline",
    "clean_drug": "varenicline",
    "explanation": "Varenicline provides both agonist and antagonist properties, making it superior to NRT and Bupropion for many.",
    "reference": "CDC/AHA Smoking Cessation Guidelines 2026."
  },
  {
    "date": "2026-04-21",
    "patient_profile": "65yo Female. PMH: Hypothyroidism (newly diagnosed).",
    "presentation": "Complains of fatigue, weight gain, and feeling cold. TSH is elevated. Needs standard replacement therapy.",
    "labs_diagnostics": "TSH: 8.5 mIU/L (Ref: 0.5-4.5). Free T4: 0.7 ng/dL (Ref: 0.9-2.3).",
    "hint_mechanism": "Synthetic T4: Provides a steady source of thyroxine to normalize metabolic processes.",
    "hint_clinical_pearl": "Johnson Pearl: Take on an empty stomach 30-60 min before breakfast; wait 4 hours for iron/calcium.",
    "correct_drug": "Levothyroxine",
    "clean_drug": "levothyroxine",
    "explanation": "Levothyroxine is the drug of choice for hypothyroidism due to its long half-life and reliable absorption.",
    "reference": "ATA Guidelines for Hypothyroidism 2025."
  },
  {
    "date": "2026-04-22",
    "patient_profile": "50yo Female. PMH: Chronic Migraines (4-5 episodes per month). Overusing Sumatriptan.",
    "presentation": "Seeking a preventive long-term strategy to reduce the frequency of attacks. Has mild hypertension.",
    "labs_diagnostics": "BP: 138/88. HR: 82. EKG: Normal.",
    "hint_mechanism": "Beta-Blocker (non-selective): Decreases neurogenic inflammation and prevents vasodilation in cerebral vessels.",
    "hint_clinical_pearl": "Johnson Pearl: Excellent choice when patient has comorbid hypertension. Avoid in asthma.",
    "correct_drug": "Propranolol",
    "clean_drug": "propranolol",
    "explanation": "Propranolol is a Level A evidence prophylactic agent for migraine prevention.",
    "reference": "AHS/AAN Migraine Prophylaxis Update 2025."
  },
  {
    "date": "2026-04-23",
    "patient_profile": "35yo Male. PMH: Schizophrenia (treatment-resistant).",
    "presentation": "Failing therapy with Risperidone and Olanzapine. Continues to have auditory hallucinations and paranoia. Needs last-line therapy.",
    "labs_diagnostics": "Baseline ANC: 2500 cells/mm3. Weight: +5kg since last visit.",
    "hint_mechanism": "Atypical Antipsychotic: High affinity for D4 and 5-HT2 receptors; weak D2 blocker.",
    "hint_clinical_pearl": "Johnson Pearl: Gold standard for resistant cases but requires REMS monitoring for agranulocytosis risk.",
    "correct_drug": "Clozapine",
    "clean_drug": "clozapine",
    "explanation": "Clozapine is the only antipsychotic proven effective for treatment-resistant schizophrenia.",
    "reference": "Clozapine REMS Program Guidelines 2026."
  },
  {
    "date": "2026-04-24",
    "patient_profile": "48yo Male. PMH: Peptic Ulcer Disease (H. pylori negative). Uses Ibuprofen daily for back pain.",
    "presentation": "Occasional epigastric pain. Needs the most potent acid suppression for healing gastric erosions.",
    "labs_diagnostics": "Endoscopy: Gastric erosion. Urea Breath Test: Negative.",
    "hint_mechanism": "Proton Pump Inhibitor (PPI): Irreversibly binds to H+/K+ ATPase pump in parietal cells.",
    "hint_clinical_pearl": "Johnson Pearl: Best taken 30-60 minutes before the first meal of the day to ensure pumps are active.",
    "correct_drug": "Omeprazole",
    "clean_drug": "omeprazole",
    "explanation": "PPIs are superior to H2RAs for healing NSAID-induced gastric ulcers.",
    "reference": "ACG Management of PUD 2025."
  },
  {
    "date": "2026-04-25",
    "patient_profile": "12yo Male. PMH: ADHD (Combined type). Weight: 35kg.",
    "presentation": "Teachers report poor focus and hyperactivity in the morning. Goal: First-line stimulant therapy.",
    "labs_diagnostics": "BP: 105/65. HR: 88. Height: 50th percentile.",
    "hint_mechanism": "Stimulant: Blocks the reuptake of norepinephrine and dopamine, increasing synaptic concentrations.",
    "hint_clinical_pearl": "Johnson Pearl: Appetite suppression is common; high calorie meals at night or drug holidays can help manage weight.",
    "correct_drug": "Methylphenidate",
    "clean_drug": "methylphenidate",
    "explanation": "Methylphenidate is a first-line stimulant for pediatric ADHD with a well-characterized safety profile.",
    "reference": "AAP Clinical Practice Guidelines for ADHD 2025."
  },
  {
    "date": "2026-04-26",
    "patient_profile": "60yo Male. PMH: COPD (Group B). Smoker (quit 2 years ago).",
    "presentation": "Symptoms of dyspnea and chronic cough. CAT score: 16. Currently only on SABA as needed. Needs a maintenance bronchodilator.",
    "labs_diagnostics": "FEV1/FVC < 0.70. Eosinophils: 150 cells/uL.",
    "hint_mechanism": "LAMA: Antagonizes M3 receptors in bronchial smooth muscle leading to prolonged bronchodilation.",
    "hint_clinical_pearl": "Johnson Pearl: Dry mouth is the most common side effect. Use regularly for symptom control, not rescue.",
    "correct_drug": "Tiotropium",
    "clean_drug": "tiotropium",
    "explanation": "LAMAs like Tiotropium are the foundation of therapy for COPD patients with consistent dyspnea.",
    "reference": "GOLD Global Strategy for COPD 2026."
  },
  {
    "date": "2026-04-27",
    "patient_profile": "55yo Female. PMH: Rheumatoid Arthritis. Newly diagnosed.",
    "presentation": "Morning stiffness > 1 hour. Symmetrical joint swelling in hands. Needs first-line DMARD maintenance.",
    "labs_diagnostics": "CRP: Elevated. RF: (+). anti-CCP: (+). AST/ALT: Normal.",
    "hint_mechanism": "Antifolate DMARD: Inhibits dihydrofolate reductase to suppress immune-mediated joint destruction.",
    "hint_clinical_pearl": "Johnson Pearl: Supplement with Folic Acid 1mg daily to reduce GI and hematologic toxicity.",
    "correct_drug": "Methotrexate",
    "clean_drug": "methotrexate",
    "explanation": "Methotrexate is the 'anchor drug' and the global first-line choice for RA management.",
    "reference": "ACR Management of Rheumatoid Arthritis 2025."
  },
  {
    "date": "2026-04-28",
    "patient_profile": "65yo Male. PMH: Parkinson's Disease. On Carbidopa/Levodopa 25/100 TID.",
    "presentation": "Increasing 'off' time and tremors before each scheduled dose. Needs to extend the half-life of his current levodopa.",
    "labs_diagnostics": "Physical Exam: Resting tremor, bradykinesia noted.",
    "hint_mechanism": "COMT Inhibitor: Prevents the peripheral breakdown of levodopa, increasing the amount crossing the BBB.",
    "hint_clinical_pearl": "Johnson Pearl: Only effective when used with levodopa. May cause orange-brown urine discoloration.",
    "correct_drug": "Entacapone",
    "clean_drug": "entacapone",
    "explanation": "Entacapone is used specifically to manage 'wearing-off' symptoms in Parkinson's disease.",
    "reference": "MDS Evidence-Based Review of PD 2026."
  },
  {
    "date": "2026-04-29",
    "patient_profile": "70yo Female. PMH: Alzheimer's Disease (Mild). Living with daughter.",
    "presentation": "Increasing memory loss and confusion. Family seeking a safe, first-line pharmacological agent for symptoms.",
    "labs_diagnostics": "MMSE: 20. Heart Rate: 72. BP: 120/80.",
    "hint_mechanism": "Cholinesterase Inhibitor: Prevents the breakdown of acetylcholine in the synaptic cleft.",
    "hint_clinical_pearl": "Johnson Pearl: GI side effects are most common. Monitor for bradycardia and syncope.",
    "correct_drug": "Donepezil",
    "clean_drug": "donepezil",
    "explanation": "Donepezil is first-line for symptomatic treatment of cognitive decline in Alzheimer's.",
    "reference": "AAN Practice Guideline for Dementia 2025."
  }

];

async function startUpload() {
  console.log("Attempting Clinical Data Sync...");
  try {
    // 📡 Check Connection
    await db.listCollections();
    console.log("📡 Connection established to Firebase.");

    for (const item of casesToUpload) {
      // THE FIX: Use 'item.date' instead of 'docId'
      if (!item.date) {
        console.error(`⚠️ Skipping: No date found for ${item.correct_drug}`);
        continue;
      }

      const docRef = db.collection("cases").doc(item.date);
      await docRef.set(item);
      console.log(`✅ Success: ${item.date} (${item.correct_drug})`);
    }

    console.log("🚀 All Clinical Cases Live!");
  } catch (error) {
    console.error("❌ CLASSIFIED ERROR:", error.message);
    if (error.message.includes("UNAUTHENTICATED")) {
      console.log("\n💡 DIAGNOSIS: Check your JSON key names or your IAM permissions.");
    }
  }
}

startUpload();
