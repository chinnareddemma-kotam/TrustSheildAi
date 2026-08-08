import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
)

# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = r".\data\raw\opspam-reiew-folder\fake_reviews_dataset.csv"

MODEL_DIR = r".\ml\models"
RESULTS_DIR = r".\ml\results"

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)


# ============================================================
# LOAD DATASET
# ============================================================

print("=" * 60)
print("TRUSTSHIELD AI - REVIEW MODERATION MODEL")
print("=" * 60)

print("\nLoading OPSPAM dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")

# Keep only rows with text and label
df = df.dropna(subset=["text", "label"])

df["text"] = df["text"].astype(str)
df["label"] = df["label"].astype(int)

print(f"\nUsable rows: {len(df)}")

print("\nLabel distribution:")
print(df["label"].value_counts())


# ============================================================
# FEATURES / TARGET
# ============================================================

X = df["text"]
y = df["label"]


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print("\nTrain samples:", len(X_train))
print("Test samples :", len(X_test))


# ============================================================
# TF-IDF FEATURE EXTRACTION
# ============================================================

print("\nCreating TF-IDF features...")

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2),
    min_df=2,
    max_features=100000,
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

print("TF-IDF train shape:", X_train_tfidf.shape)
print("TF-IDF test shape :", X_test_tfidf.shape)


# ============================================================
# TRAIN MODEL
# ============================================================

print("\nTraining Logistic Regression model...")

model = LogisticRegression(
    max_iter=1000,
    random_state=42,
)

model.fit(X_train_tfidf, y_train)

print("Training complete.")


# ============================================================
# PREDICTIONS
# ============================================================

y_pred = model.predict(X_test_tfidf)
y_prob = model.predict_proba(X_test_tfidf)[:, 1]


# ============================================================
# EVALUATION
# ============================================================

accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0,
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0,
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0,
)

roc_auc = roc_auc_score(
    y_test,
    y_prob,
)

print("\n" + "=" * 60)
print("MODEL EVALUATION")
print("=" * 60)

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, zero_division=0))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# ============================================================
# SAVE MODEL
# ============================================================

model_path = os.path.join(
    MODEL_DIR,
    "review_moderation_model.joblib",
)

vectorizer_path = os.path.join(
    MODEL_DIR,
    "review_tfidf_vectorizer.joblib",
)

joblib.dump(model, model_path)
joblib.dump(vectorizer, vectorizer_path)

print("\nSaved model:")
print(model_path)

print("\nSaved vectorizer:")
print(vectorizer_path)


# ============================================================
# SAVE METRICS
# ============================================================

metrics = {
    "dataset": "OPSPAM",
    "samples": int(len(df)),
    "train_samples": int(len(X_train)),
    "test_samples": int(len(X_test)),
    "accuracy": float(accuracy),
    "precision": float(precision),
    "recall": float(recall),
    "f1_score": float(f1),
    "roc_auc": float(roc_auc),
}

metrics_path = os.path.join(
    RESULTS_DIR,
    "review_model_metrics.json",
)

import json

with open(metrics_path, "w", encoding="utf-8") as f:
    json.dump(metrics, f, indent=2)

print("\nSaved metrics:")
print(metrics_path)

print("\n" + "=" * 60)
print("REVIEW MODERATION MODEL COMPLETE")
print("=" * 60)