from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import random

app = FastAPI()

class SensorData(BaseModel):
    rainfall: float
    soilMoisture: float
    tiltAngle: float
    loadCellWeight: float

@app.post("/predict")
def predict(data: SensorData):
    # Stub logic: generate dummy risk based on sensor values
    if data.rainfall > 100 or data.tiltAngle > 30:
        return {"risk_percentage": random.randint(70, 99), "risk_level": "HIGH"}
    elif data.rainfall > 50 or data.soilMoisture > 80:
        return {"risk_percentage": random.randint(40, 69), "risk_level": "MODERATE"}
    else:
        return {"risk_percentage": random.randint(5, 39), "risk_level": "SAFE"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
