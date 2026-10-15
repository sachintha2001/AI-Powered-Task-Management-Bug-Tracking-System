import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib

# 1. CSV ෆයිල් එකෙන් දත්ත Load කිරීම
print("Loading data from dataset.csv...")
df = pd.read_csv('dataset.csv')

# 2. AI Model එක හැදීම 
model = make_pipeline(TfidfVectorizer(), MultinomialNB())

# 3. Model එක Train කිරීම
print("Training the AI model...")
model.fit(df['description'], df['type'])

# 4. Train කරපු Model එක Save කිරීම
joblib.dump(model, 'task_model.pkl')
print(f"Model trained successfully with {len(df)} records and saved as task_model.pkl!")