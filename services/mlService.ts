import { FoodInputData, FoodAnalysisResult, SpoilageStatus } from "../types";

// --- 1. THE TRAINING DATASET ---
// Features: [isCooked (0/1), hours, temp]
// Label: SpoilageStatus
interface TrainingSample {
  isCooked: number; // 1 = Cooked, 0 = Raw
  hours: number;
  temp: number;
  label: SpoilageStatus;
  riskScore: number; // Target for regression (simplified here as associated metadata)
}

// A representative dataset based on FDA guidelines
const DATASET: TrainingSample[] = [
  // COOKED FOOD (More sensitive to bacteria like B. cereus)
  { isCooked: 1, hours: 0.5, temp: 25, label: SpoilageStatus.SAFE, riskScore: 5 },
  { isCooked: 1, hours: 1.0, temp: 25, label: SpoilageStatus.SAFE, riskScore: 15 },
  { isCooked: 1, hours: 2.5, temp: 20, label: SpoilageStatus.SAFE, riskScore: 25 },
  { isCooked: 1, hours: 3.0, temp: 25, label: SpoilageStatus.CAUTION, riskScore: 45 },
  { isCooked: 1, hours: 4.5, temp: 25, label: SpoilageStatus.REJECT, riskScore: 85 }, // > 4 hours Danger Zone
  { isCooked: 1, hours: 6.0, temp: 22, label: SpoilageStatus.REJECT, riskScore: 95 },
  { isCooked: 1, hours: 2.0, temp: 35, label: SpoilageStatus.CAUTION, riskScore: 60 }, // Hot weather accelerates
  { isCooked: 1, hours: 4.0, temp: 35, label: SpoilageStatus.REJECT, riskScore: 90 },
  { isCooked: 1, hours: 10.0, temp: 4, label: SpoilageStatus.SAFE, riskScore: 10 },   // Fridge
  { isCooked: 1, hours: 24.0, temp: 4, label: SpoilageStatus.SAFE, riskScore: 20 },   // Fridge
  { isCooked: 1, hours: 48.0, temp: 4, label: SpoilageStatus.CAUTION, riskScore: 55 }, // Fridge old
  
  // RAW FOOD (Meat/Produce - varies, but modeling conservative safety)
  { isCooked: 0, hours: 1.0, temp: 20, label: SpoilageStatus.SAFE, riskScore: 10 },
  { isCooked: 0, hours: 3.0, temp: 20, label: SpoilageStatus.CAUTION, riskScore: 40 },
  { isCooked: 0, hours: 5.0, temp: 20, label: SpoilageStatus.REJECT, riskScore: 75 },
  { isCooked: 0, hours: 1.0, temp: 30, label: SpoilageStatus.CAUTION, riskScore: 45 },
  { isCooked: 0, hours: 3.0, temp: 30, label: SpoilageStatus.REJECT, riskScore: 85 },
  { isCooked: 0, hours: 12.0, temp: 5, label: SpoilageStatus.SAFE, riskScore: 15 },    // Fridge
  
  // FROZEN
  { isCooked: 1, hours: 100, temp: -5, label: SpoilageStatus.SAFE, riskScore: 0 },
  { isCooked: 0, hours: 100, temp: -5, label: SpoilageStatus.SAFE, riskScore: 0 },
];

// --- 2. DECISION TREE ALGORITHM (CART Simplified) ---

class Node {
  featureIndex: number | null = null; // 0=isCooked, 1=hours, 2=temp
  threshold: number | null = null;
  left: Node | null = null;
  right: Node | null = null;
  prediction: SpoilageStatus | null = null;
  avgRisk: number = 0;

  constructor(prediction?: SpoilageStatus, avgRisk: number = 0) {
    if (prediction) {
      this.prediction = prediction;
    }
    this.avgRisk = avgRisk;
  }
}

class DecisionTreeClassifier {
  root: Node | null = null;
  maxDepth: number = 5;
  minSamplesSplit: number = 2;

  // Gini Impurity Calculation
  private calculateGini(labels: SpoilageStatus[]): number {
    const counts: Record<string, number> = {};
    labels.forEach(l => counts[l] = (counts[l] || 0) + 1);
    
    let impurity = 1;
    const total = labels.length;
    for (const key in counts) {
      const prob = counts[key] / total;
      impurity -= prob * prob;
    }
    return impurity;
  }

  // Find the best split for data
  private getBestSplit(data: TrainingSample[]) {
    let bestGini = Infinity;
    let split = { featureIndex: -1, threshold: 0, left: [] as TrainingSample[], right: [] as TrainingSample[] };
    
    const nFeatures = 3; // isCooked, hours, temp

    for (let f = 0; f < nFeatures; f++) {
      // Get unique values for thresholds
      const thresholds = [...new Set(data.map(d => f === 0 ? d.isCooked : f === 1 ? d.hours : d.temp))];
      
      for (const t of thresholds) {
        const left = data.filter(d => (f === 0 ? d.isCooked : f === 1 ? d.hours : d.temp) <= t);
        const right = data.filter(d => (f === 0 ? d.isCooked : f === 1 ? d.hours : d.temp) > t);
        
        if (left.length === 0 || right.length === 0) continue;

        const giniLeft = this.calculateGini(left.map(d => d.label));
        const giniRight = this.calculateGini(right.map(d => d.label));
        const weightedGini = (left.length * giniLeft + right.length * giniRight) / data.length;

        if (weightedGini < bestGini) {
          bestGini = weightedGini;
          split = { featureIndex: f, threshold: t, left, right };
        }
      }
    }
    return split;
  }

  private buildTree(data: TrainingSample[], depth: number): Node {
    const labels = data.map(d => d.label);
    const uniqueLabels = [...new Set(labels)];
    const avgRisk = data.reduce((sum, d) => sum + d.riskScore, 0) / data.length;

    // Base cases: Pure node, max depth, or not enough samples
    if (uniqueLabels.length === 1 || depth >= this.maxDepth || data.length < this.minSamplesSplit) {
      // Return leaf with majority class
      const counts = labels.reduce((acc, l) => { acc[l] = (acc[l] || 0) + 1; return acc; }, {} as Record<string, number>);
      const prediction = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as SpoilageStatus;
      return new Node(prediction, avgRisk);
    }

    const split = this.getBestSplit(data);
    
    if (split.featureIndex === -1) {
       // Cannot split further
       const counts = labels.reduce((acc, l) => { acc[l] = (acc[l] || 0) + 1; return acc; }, {} as Record<string, number>);
       const prediction = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as SpoilageStatus;
       return new Node(prediction, avgRisk);
    }

    const node = new Node(undefined, avgRisk);
    node.featureIndex = split.featureIndex;
    node.threshold = split.threshold;
    node.left = this.buildTree(split.left, depth + 1);
    node.right = this.buildTree(split.right, depth + 1);
    
    return node;
  }

  train(data: TrainingSample[]) {
    console.log("Training Decision Tree on " + data.length + " samples...");
    this.root = this.buildTree(data, 0);
    console.log("Model Training Complete.");
  }

  predict(sample: {isCooked: number, hours: number, temp: number}): { label: SpoilageStatus, risk: number } {
    let node = this.root;
    while (node && node.prediction === null) {
      const val = node.featureIndex === 0 ? sample.isCooked : node.featureIndex === 1 ? sample.hours : sample.temp;
      if (val <= node.threshold!) {
        node = node.left;
      } else {
        node = node.right;
      }
    }
    return { label: node?.prediction || SpoilageStatus.CAUTION, risk: node?.avgRisk || 50 };
  }
}

// Initialize and Train Singleton Model
const model = new DecisionTreeClassifier();
// We train immediately so the model is ready
model.train(DATASET);

// --- 3. HELPER FUNCTIONS ---

const getHandlingInstruction = (status: SpoilageStatus, temp: number): string => {
  if (status === SpoilageStatus.SAFE) {
    return temp > 10 ? "Refrigerate immediately to maintain freshness." : "Keep chilled.";
  }
  if (status === SpoilageStatus.CAUTION) {
    return "Check for smell/texture changes. Consume immediately or freeze. Do not re-store.";
  }
  return "Do not consume or donate. Dispose of safely to prevent contamination.";
};

const getReason = (data: FoodInputData, status: SpoilageStatus, risk: number): string => {
  const timeMsg = `${data.hoursSincePrep}h exposure`;
  const tempMsg = `at ${data.storageTemp}°C`;
  
  if (status === SpoilageStatus.REJECT) {
    if (data.storageTemp > 20 && data.hoursSincePrep > 4) return `High bacterial risk due to ${timeMsg} ${tempMsg} (Danger Zone).`;
    if (risk > 80) return "Predicted spoilage risk is critically high based on historical safety data.";
  }
  if (status === SpoilageStatus.CAUTION) return `Approaching safety limits (${timeMsg}). Quality may be compromised.`;
  
  return `Conditions (${timeMsg}, ${tempMsg}) are within safe donation limits.`;
};

const calculateRemainingSafeHours = (data: FoodInputData, status: SpoilageStatus): number => {
  if (status === SpoilageStatus.REJECT) return 0;
  
  // Linear regression-style heuristic for remaining time
  // Basic rule: 4 hours max at room temp (20C+). 
  let maxHours = 4;
  if (data.storageTemp < 5) maxHours = 72; // Fridge
  else if (data.storageTemp < 15) maxHours = 12; // Cool
  else if (data.storageTemp > 30) maxHours = 2; // Hot

  const remaining = Math.max(0, maxHours - data.hoursSincePrep);
  return parseFloat(remaining.toFixed(1));
};

// --- 4. EXPORTED SERVICE ---

export const checkFoodSpoilage = async (data: FoodInputData): Promise<FoodAnalysisResult> => {
  // Simulate network delay to make it feel like "Analysis"
  await new Promise(resolve => setTimeout(resolve, 800));

  const inputVector = {
    isCooked: data.isCooked ? 1 : 0,
    hours: data.hoursSincePrep,
    temp: data.storageTemp
  };

  const prediction = model.predict(inputVector);

  // Post-processing prediction to ensure safety critical overrides (Fallback rules)
  // Even ML needs guardrails!
  let finalStatus = prediction.label;
  let finalRisk = Math.round(prediction.risk);

  // Guardrail: Bacillus Cereus rule for Rice/Pasta logic implied in general cooked food
  if (data.isCooked && data.storageTemp > 20 && data.hoursSincePrep > 4) {
    finalStatus = SpoilageStatus.REJECT;
    finalRisk = Math.max(finalRisk, 85);
  }

  return {
    risk_score: finalRisk,
    status: finalStatus,
    reason: getReason(data, finalStatus, finalRisk),
    handling_instruction: getHandlingInstruction(finalStatus, data.storageTemp),
    remaining_safe_hours: calculateRemainingSafeHours(data, finalStatus)
  };
};
