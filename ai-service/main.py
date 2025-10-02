from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import joblib
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

app = FastAPI(
    title="Finance Tracker AI Service",
    description="AI-powered insights for financial data analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Transaction(BaseModel):
    id: str
    amount: float
    type: str
    category: str
    date: str
    description: Optional[str] = None

class InsightRequest(BaseModel):
    transactions: List[Transaction]
    user_id: str
    timeframe: Optional[str] = "30d"

class InsightResponse(BaseModel):
    insights: List[Dict[str, Any]]
    trends: Dict[str, Any]
    anomalies: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]

class ForecastRequest(BaseModel):
    historical_data: List[Dict[str, Any]]
    periods: int = 30

class ForecastResponse(BaseModel):
    forecast: List[Dict[str, Any]]
    confidence: float

# Global variables for models
anomaly_detector = None
scaler = None

@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    global anomaly_detector, scaler
    
    # Initialize anomaly detection model
    anomaly_detector = IsolationForest(
        contamination=0.1,
        random_state=42,
        n_estimators=100
    )
    
    # Initialize scaler
    scaler = StandardScaler()
    
    print("🤖 AI Service started successfully")

@app.get("/")
async def root():
    return {"message": "Finance Tracker AI Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/insights/generate", response_model=InsightResponse)
async def generate_insights(request: InsightRequest):
    """Generate AI-powered insights from transaction data"""
    try:
        # Convert transactions to DataFrame
        df = pd.DataFrame([t.dict() for t in request.transactions])
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        insights = []
        trends = {}
        anomalies = []
        recommendations = []
        
        # Generate basic insights
        insights.extend(await generate_basic_insights(df))
        
        # Detect trends
        trends = await detect_trends(df)
        
        # Detect anomalies
        anomalies = await detect_anomalies(df)
        
        # Generate recommendations
        recommendations = await generate_recommendations(df, trends)
        
        return InsightResponse(
            insights=insights,
            trends=trends,
            anomalies=anomalies,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

@app.post("/api/forecast/spending", response_model=ForecastResponse)
async def forecast_spending(request: ForecastRequest):
    """Forecast future spending based on historical data"""
    try:
        # Simple moving average forecast (can be enhanced with proper time series models)
        df = pd.DataFrame(request.historical_data)
        if len(df) < 2:
            raise HTTPException(status_code=400, detail="Insufficient data for forecasting")
        
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Calculate moving average
        window = min(7, len(df))
        forecast_values = []
        
        for i in range(request.periods):
            last_values = df['amount'].tail(window).values
            next_value = np.mean(last_values) * (1 + np.random.normal(0, 0.1))  # Add some noise
            forecast_values.append({
                'date': (df['date'].iloc[-1] + timedelta(days=i+1)).isoformat(),
                'amount': float(next_value),
                'type': 'expense'  # Default to expense for forecasting
            })
        
        # Calculate confidence based on data quality
        confidence = min(0.95, len(df) / 100)  # Simple confidence calculation
        
        return ForecastResponse(
            forecast=forecast_values,
            confidence=confidence
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")

async def generate_basic_insights(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Generate basic spending insights"""
    insights = []
    
    if df.empty:
        return insights
    
    # Total spending insight
    total_spent = df[df['type'] == 'expense']['amount'].sum()
    total_income = df[df['type'] == 'income']['amount'].sum()
    
    insights.append({
        "type": "summary",
        "title": "Financial Overview",
        "message": f"You've spent ${total_spent:.2f} and earned ${total_income:.2f}",
        "confidence": 0.95,
        "data": {
            "total_spent": total_spent,
            "total_income": total_income,
            "net_savings": total_income - total_spent
        }
    })
    
    # Top spending category
    if not df[df['type'] == 'expense'].empty:
        top_category = df[df['type'] == 'expense'].groupby('category')['amount'].sum().idxmax()
        top_amount = df[df['type'] == 'expense'].groupby('category')['amount'].sum().max()
        
        insights.append({
            "type": "spending_pattern",
            "title": "Top Spending Category",
            "message": f"Your highest spending is in {top_category} (${top_amount:.2f})",
            "confidence": 0.85,
            "data": {
                "category": top_category,
                "amount": top_amount
            }
        })
    
    return insights

async def detect_trends(df: pd.DataFrame) -> Dict[str, Any]:
    """Detect spending trends"""
    trends = {}
    
    if len(df) < 2:
        return trends
    
    # Monthly trends
    df['month'] = df['date'].dt.to_period('M')
    monthly_data = df.groupby(['month', 'type'])['amount'].sum().unstack(fill_value=0)
    
    if not monthly_data.empty and len(monthly_data) > 1:
        # Calculate month-over-month changes
        if 'expense' in monthly_data.columns:
            expense_trend = (monthly_data['expense'].iloc[-1] - monthly_data['expense'].iloc[-2]) / monthly_data['expense'].iloc[-2] * 100
            trends['expense_trend'] = {
                "change_percent": float(expense_trend),
                "direction": "up" if expense_trend > 0 else "down",
                "current_month": float(monthly_data['expense'].iloc[-1]),
                "previous_month": float(monthly_data['expense'].iloc[-2])
            }
    
    return trends

async def detect_anomalies(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Detect anomalous transactions"""
    anomalies = []
    
    if len(df[df['type'] == 'expense']) < 10:
        return anomalies
    
    try:
        # Prepare features for anomaly detection
        expense_df = df[df['type'] == 'expense'].copy()
        
        if len(expense_df) < 10:
            return anomalies
            
        # Simple anomaly detection based on amount (can be enhanced)
        amounts = expense_df['amount'].values.reshape(-1, 1)
        
        # Fit and predict anomalies
        global anomaly_detector, scaler
        
        # Scale the data
        amounts_scaled = scaler.fit_transform(amounts)
        
        # Fit the model
        anomaly_labels = anomaly_detector.fit_predict(amounts_scaled)
        
        # Get anomalies (label = -1)
        anomaly_indices = np.where(anomaly_labels == -1)[0]
        
        for idx in anomaly_indices:
            transaction = expense_df.iloc[idx]
            anomalies.append({
                "transaction_id": str(transaction['id']),
                "amount": float(transaction['amount']),
                "category": transaction['category'],
                "date": transaction['date'].isoformat(),
                "reason": "Unusually high amount for this category",
                "confidence": 0.75
            })
            
    except Exception as e:
        print(f"Anomaly detection error: {e}")
    
    return anomalies

async def generate_recommendations(df: pd.DataFrame, trends: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate personalized recommendations"""
    recommendations = []
    
    if df.empty:
        return recommendations
    
    # Recommendation based on spending patterns
    expense_df = df[df['type'] == 'expense']
    if not expense_df.empty:
        category_spending = expense_df.groupby('category')['amount'].sum()
        
        # Suggest reducing top spending category
        if len(category_spending) > 0:
            top_category = category_spending.idxmax()
            top_amount = category_spending.max()
            total_expenses = expense_df['amount'].sum()
            
            if top_amount / total_expenses > 0.3:  # If top category is more than 30% of spending
                recommendations.append({
                    "type": "spending_reduction",
                    "title": "Reduce High Spending",
                    "message": f"Consider reducing spending in {top_category} which accounts for {top_amount/total_expenses*100:.1f}% of your expenses",
                    "priority": "high",
                    "action": f"Set a budget for {top_category}"
                })
    
    # Savings recommendation
    income = df[df['type'] == 'income']['amount'].sum()
    expenses = df[df['type'] == 'expense']['amount'].sum()
    
    if income > 0:
        savings_rate = (income - expenses) / income * 100
        
        if savings_rate < 20:
            recommendations.append({
                "type": "savings_boost",
                "title": "Increase Savings",
                "message": f"Your savings rate is {savings_rate:.1f}%. Aim for 20% to build your financial safety net.",
                "priority": "medium",
                "action": "Review discretionary spending"
            })
    
    return recommendations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)