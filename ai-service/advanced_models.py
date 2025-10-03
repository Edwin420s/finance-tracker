import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import warnings
warnings.filterwarnings('ignore')

class AdvancedFinancialModels:
    def __init__(self):
        self.category_classifier = None
        self.anomaly_detector = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.tfidf_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.is_trained = False
    
    def prepare_features(self, transactions_df):
        """Prepare features for machine learning models"""
        df = transactions_df.copy()
        
        # Date features
        df['date'] = pd.to_datetime(df['date'])
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['month'] = df['date'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Amount features
        df['amount_log'] = np.log1p(df['amount'])
        df['amount_zscore'] = (df['amount'] - df['amount'].mean()) / df['amount'].std()
        
        # Text features from description
        if 'description' in df.columns:
            descriptions = df['description'].fillna('')
            tfidf_features = self.tfidf_vectorizer.fit_transform(descriptions)
            tfidf_df = pd.DataFrame(tfidf_features.toarray(), 
                                  columns=[f'tfidf_{i}' for i in range(tfidf_features.shape[1])])
            df = pd.concat([df, tfidf_df], axis=1)
        
        # Merchant features (if available)
        if 'merchant' in df.columns:
            df['merchant_count'] = df.groupby('merchant')['merchant'].transform('count')
        
        return df
    
    def train_category_classifier(self, transactions_df):
        """Train a model to predict transaction categories"""
        try:
            df = self.prepare_features(transactions_df)
            
            # Only train if we have enough data and categories
            if len(df) < 10 or df['category'].nunique() < 2:
                return False
            
            # Prepare features and target
            feature_columns = ['amount', 'day_of_week', 'day_of_month', 'month', 'is_weekend', 'amount_log', 'amount_zscore']
            feature_columns += [col for col in df.columns if col.startswith('tfidf_')]
            
            # Only use columns that exist
            available_features = [col for col in feature_columns if col in df.columns]
            
            X = df[available_features].fillna(0)
            y = self.label_encoder.fit_transform(df['category'])
            
            # Train classifier
            self.category_classifier = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                class_weight='balanced'
            )
            
            self.category_classifier.fit(X, y)
            return True
            
        except Exception as e:
            print(f"Error training category classifier: {e}")
            return False
    
    def predict_category(self, transaction_data):
        """Predict category for new transactions"""
        if not self.category_classifier:
            return None
        
        try:
            df = pd.DataFrame([transaction_data])
            df = self.prepare_features(df)
            
            feature_columns = ['amount', 'day_of_week', 'day_of_month', 'month', 'is_weekend', 'amount_log', 'amount_zscore']
            feature_columns += [col for col in df.columns if col.startswith('tfidf_')]
            available_features = [col for col in feature_columns if col in df.columns]
            
            X = df[available_features].fillna(0)
            prediction = self.category_classifier.predict(X)[0]
            
            return self.label_encoder.inverse_transform([prediction])[0]
            
        except Exception as e:
            print(f"Error predicting category: {e}")
            return None
    
    def train_anomaly_detector(self, transactions_df):
        """Train anomaly detection model"""
        try:
            df = self.prepare_features(transactions_df)
            
            if len(df) < 20:
                return False
            
            # Use only expense transactions for anomaly detection
            expense_df = df[df['type'] == 'expense']
            
            if len(expense_df) < 10:
                return False
            
            feature_columns = ['amount', 'amount_log', 'amount_zscore', 'day_of_week', 'day_of_month']
            available_features = [col for col in feature_columns if col in expense_df.columns]
            
            X = expense_df[available_features].fillna(0)
            X_scaled = self.scaler.fit_transform(X)
            
            self.anomaly_detector = IsolationForest(
                contamination=0.1,
                random_state=42,
                n_estimators=100
            )
            
            self.anomaly_detector.fit(X_scaled)
            return True
            
        except Exception as e:
            print(f"Error training anomaly detector: {e}")
            return False
    
    def detect_anomalies(self, transactions_df):
        """Detect anomalous transactions"""
        if not self.anomaly_detector:
            return []
        
        try:
            df = self.prepare_features(transactions_df)
            expense_df = df[df['type'] == 'expense']
            
            if len(expense_df) == 0:
                return []
            
            feature_columns = ['amount', 'amount_log', 'amount_zscore', 'day_of_week', 'day_of_month']
            available_features = [col for col in feature_columns if col in expense_df.columns]
            
            X = expense_df[available_features].fillna(0)
            X_scaled = self.scaler.transform(X)
            
            anomalies = self.anomaly_detector.predict(X_scaled)
            anomaly_indices = np.where(anomalies == -1)[0]
            
            results = []
            for idx in anomaly_indices:
                transaction = expense_df.iloc[idx]
                results.append({
                    'transaction_id': str(transaction['id']),
                    'amount': float(transaction['amount']),
                    'category': transaction['category'],
                    'date': transaction['date'].isoformat(),
                    'description': transaction.get('description', ''),
                    'confidence': 0.8,
                    'reason': 'Unusual spending pattern detected'
                })
            
            return results
            
        except Exception as e:
            print(f"Error detecting anomalies: {e}")
            return []
    
    def train_models(self, transactions_df):
        """Train all models"""
        category_trained = self.train_category_classifier(transactions_df)
        anomaly_trained = self.train_anomaly_detector(transactions_df)
        
        self.is_trained = category_trained or anomaly_trained
        return self.is_trained
    
    def save_models(self, filepath):
        """Save trained models"""
        if self.is_trained:
            model_data = {
                'category_classifier': self.category_classifier,
                'anomaly_detector': self.anomaly_detector,
                'scaler': self.scaler,
                'label_encoder': self.label_encoder,
                'tfidf_vectorizer': self.tfidf_vectorizer,
                'is_trained': self.is_trained
            }
            joblib.dump(model_data, filepath)
    
    def load_models(self, filepath):
        """Load trained models"""
        try:
            model_data = joblib.load(filepath)
            self.category_classifier = model_data['category_classifier']
            self.anomaly_detector = model_data['anomaly_detector']
            self.scaler = model_data['scaler']
            self.label_encoder = model_data['label_encoder']
            self.tfidf_vectorizer = model_data['tfidf_vectorizer']
            self.is_trained = model_data['is_trained']
            return True
        except:
            return False