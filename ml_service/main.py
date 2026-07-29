from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import random

app = FastAPI()

class SensorData(BaseModel):
    rainfall: bool
    soilMoisture: float
    tiltAngle: float
    soilPressure: float


@app.post("/predict")
def predict(data: SensorData):

    is_raining = data.rainfall  # True = Raining

    # 🔴 HIGH Risk
    if (
        (is_raining and data.soilMoisture > 65)
        or data.tiltAngle > 60
    ):
        return {
            "risk_percentage": random.randint(80, 95),
            "risk_level": "HIGH"
        }

    # 🟡 MODERATE Risk
    if is_raining and data.soilMoisture > 50:
        return {
            "risk_percentage": random.randint(45, 70),
            "risk_level": "MODERATE"
        }

    # 🟢 SAFE
    return {
        "risk_percentage": random.randint(5, 30),
        "risk_level": "SAFE"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)