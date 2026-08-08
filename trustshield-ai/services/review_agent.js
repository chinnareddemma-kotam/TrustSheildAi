/**
 * TrustShield AI
 * Review Moderation Agent
 *
 * Uses the trained OPSpam review moderation model.
 *
 * Model:
 * - TF-IDF vectorizer
 * - Logistic Regression classifier
 *
 * Endpoint:
 * POST /api/ai/review/analyze
 */

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const MODEL_PATH = path.join(
  __dirname,
  '..',
  'ml',
  'models',
  'review_moderation_model.joblib'
);

const VECTORIZER_PATH = path.join(
  __dirname,
  '..',
  'ml',
  'models',
  'review_tfidf_vectorizer.joblib'
);

// ---------------------------------------------------------
// Validate model files
// ---------------------------------------------------------

if (!fs.existsSync(MODEL_PATH)) {
  console.warn(
    '[Review Agent] Model not found:',
    MODEL_PATH
  );
}

if (!fs.existsSync(VECTORIZER_PATH)) {
  console.warn(
    '[Review Agent] Vectorizer not found:',
    VECTORIZER_PATH
  );
}

// ---------------------------------------------------------
// Run trained Python model
// ---------------------------------------------------------

function runModel(reviewText) {
  const pythonCode = `
import sys
import json
import joblib

model_path = sys.argv[1]
vectorizer_path = sys.argv[2]
review_text = sys.argv[3]

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

X = vectorizer.transform([review_text])

prediction = int(model.predict(X)[0])

if hasattr(model, "predict_proba"):
    probabilities = model.predict_proba(X)[0]

    # Probability of class 1
    classes = list(model.classes_)

    if 1 in classes:
        fake_probability = float(
            probabilities[classes.index(1)]
        )
    else:
        fake_probability = float(probabilities[-1])
else:
    fake_probability = float(prediction)

print(json.dumps({
    "prediction": prediction,
    "fakeProbability": fake_probability
}))
`;

  const result = spawnSync(
    'python',
    [
      '-c',
      pythonCode,
      MODEL_PATH,
      VECTORIZER_PATH,
      reviewText
    ],
    {
      encoding: 'utf8',
      windowsHide: true
    }
  );

  if (result.error) {
    throw new Error(
      `Python execution failed: ${result.error.message}`
    );
  }

  if (result.status !== 0) {
    throw new Error(
      `Review model failed: ${result.stderr}`
    );
  }

  return JSON.parse(result.stdout.trim());
}

// ---------------------------------------------------------
// Review evaluation
// ---------------------------------------------------------

function evaluateReview(reviewInput) {
  const startTime = Date.now();

  const {
    reviewText = '',
    rating = 5,
    isVerifiedPurchase = true,
    customerId = '',
    productId = '',
    context = {}
  } = reviewInput || {};

  if (!reviewText || !reviewText.trim()) {
    return {
      fakeProbability: 0,
      riskLevel: 'LOW',
      recommendation: 'REJECTED_INPUT',
      explanation: 'Review text is required.',
      signals: ['Missing review text'],
      modelVersion: 'OPSPAM-TFIDF-LOGISTIC-v1',
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  let modelResult;

  try {
    modelResult = runModel(reviewText.trim());
  } catch (error) {
    console.error(
      '[Review Agent] Model execution error:',
      error.message
    );

    return {
      fakeProbability: null,
      riskLevel: 'UNKNOWN',
      recommendation: 'HUMAN_REVIEW',
      explanation:
        'The trained review moderation model could not be executed. Human review is required.',
      signals: [
        'ML model execution failure'
      ],
      modelVersion: 'OPSPAM-TFIDF-LOGISTIC-v1',
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  const fakeProbability = Math.round(
    modelResult.fakeProbability * 100
  );

  // -------------------------------------------------------
  // Additional contextual signals
  // -------------------------------------------------------

  const signals = [];

  if (!isVerifiedPurchase) {
    signals.push(
      'Unverified purchase'
    );
  }

  if (rating === 5) {
    signals.push(
      'Five-star rating'
    );
  }

  if (
    context &&
    context.submissionBurstCount &&
    context.submissionBurstCount > 3
  ) {
    signals.push(
      `High review submission burst: ${context.submissionBurstCount}`
    );
  }

  if (reviewText.trim().length < 20) {
    signals.push(
      'Very short review text'
    );
  }

  // -------------------------------------------------------
  // Risk classification
  // -------------------------------------------------------

  let riskLevel;
  let recommendation;

  if (fakeProbability >= 70) {
    riskLevel = 'HIGH';
    recommendation = 'BLOCKED';
  } else if (fakeProbability >= 45) {
    riskLevel = 'MEDIUM';
    recommendation = 'FLAGGED';
  } else {
    riskLevel = 'LOW';
    recommendation = 'APPROVED';
  }

  // -------------------------------------------------------
  // Human-in-the-loop policy
  // -------------------------------------------------------

  let humanReviewRequired = false;

  if (
    fakeProbability >= 45 &&
    fakeProbability < 70
  ) {
    humanReviewRequired = true;
  }

  if (
    context &&
    context.submissionBurstCount &&
    context.submissionBurstCount > 3
  ) {
    humanReviewRequired = true;
  }

  if (humanReviewRequired) {
    recommendation = 'HUMAN_REVIEW';
  }

  // -------------------------------------------------------
  // Explanation
  // -------------------------------------------------------

  const explanation = [
    'TRUSTSHIELD AI — REVIEW MODERATION AGENT',

    `WHAT HAPPENED: Review analyzed using the trained OPSpam-based TF-IDF + Logistic Regression model.`,

    `WHY: Model estimated fake-review probability at ${fakeProbability}%.`,

    `IMPORTANT SIGNALS: ${
      signals.length
        ? signals.join('; ')
        : 'No additional contextual risk signals detected.'
    }`,

    `MODEL RECOMMENDATION: ${recommendation}`,

    `POLICY APPLIED: ${
      fakeProbability >= 70
        ? 'High fake-review probability requires blocking.'
        : fakeProbability >= 45
          ? 'Medium fake-review probability requires human review.'
          : 'Low fake-review probability may be approved.'
    }`,

    `FINAL DECISION: ${recommendation}`,

    humanReviewRequired
      ? 'HUMAN-IN-THE-LOOP: Admin review required before final resolution.'
      : 'HUMAN-IN-THE-LOOP: Not required under current policy.'
  ].join('\n');

  const latency =
    Date.now() - startTime;

  return {
    fakeProbability,
    riskLevel,
    recommendation,
    humanReviewRequired,
    explanation,
    signals,

    modelVersion:
      'OPSPAM-TFIDF-LOGISTIC-v1',

    modelPrediction:
      modelResult.prediction,

    inputMetadata: {
      rating,
      isVerifiedPurchase,
      customerId,
      productId
    },

    latency,

    timestamp:
      new Date().toISOString()
  };
}

module.exports = {
  evaluateReview
};