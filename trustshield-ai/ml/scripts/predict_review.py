import sys
import json
import joblib


MODEL_PATH = sys.argv[1]
VECTORIZER_PATH = sys.argv[2]
REVIEW_TEXT = sys.argv[3]


model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

X = vectorizer.transform([REVIEW_TEXT])

prediction = int(model.predict(X)[0])

probabilities = model.predict_proba(X)[0]

classes = list(model.classes_)

probability_by_class = {
    str(int(cls)): float(prob)
    for cls, prob in zip(classes, probabilities)
}

print(json.dumps({
    "prediction": prediction,
    "probabilityByClass": probability_by_class
}))