import PDFDocument from "pdfkit";
import { sendSMS } from "./sms";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// 📱 Emergency Contact Numbers (Twilio Verified)
const emergencyNumbers = [
  "+919233082979",
];
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: { origin: "*" }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log("Client connected to socket.io");
  });

  // Broadcast alert function
  const broadcastAlert = (alert: any) => {
    io.emit("newAlert", alert);
  };

  // APIs
  app.get(api.sensors.latest.path, async (req, res) => {
    const sensor = await storage.getLatestSensor();
    res.json(sensor || null);
  });

  app.get(api.sensors.history.path, async (req, res) => {
    const sensors = await storage.getSensorHistory();
    res.json(sensors);
  });
  console.log("Sensor create path:", api.sensors.create.path);
  app.post(api.sensors.create.path, async (req, res) => {
    try {
      const input = api.sensors.create.input.parse(req.body);

      // ML Service Stub Integration (Python FastAPI on port 5001)
      let riskPercentage = 0;
      let riskLevel = "SAFE";
      try {
        const mlRes = await fetch("http://localhost:5001/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        });
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          riskPercentage = mlData.risk_percentage;
          riskLevel = mlData.risk_level;
        } else {
          console.error("ML service returned error:", mlRes.statusText);
          throw new Error("ML fetch not ok");
        }
      } catch (e) {
        console.error("Failed to connect to ML service. Using fallback risk assessment.");
        // Fallback dummy logic if Python service isn't running
        if (input.rainfall === true && input.tiltAngle > 30) {
          riskPercentage = 85;
          riskLevel = "HIGH";
        } else if (input.rainfall === true && input.soilMoisture > 80) {
          riskPercentage = 55;
          riskLevel = "MODERATE";
        } else {
          riskPercentage = 15;
          riskLevel = "SAFE";
        }
      }

      const sensor = await storage.createSensor({
        ...input,
        riskPercentage,
        riskLevel
      });
      console.log("Risk Level:", riskLevel);
      // Automatically generate an alert if risk is HIGH
      console.log("Risk Level:", riskLevel);

      // Automatically generate an alert if risk is HIGH
      if (riskLevel?.trim().toUpperCase() === "HIGH") {
        console.log("🔥 HIGH RISK TRIGGERED");
        console.log("INPUT DATA:", input);
        const alert = await storage.createAlert({
          locationName: sensor.locationName,   //
          message: `High risk detected!
          Weather: ${input.rainfall ? "Rain" : "Sunny"},
          Tilt: ${input.tiltAngle}°,
          Soil Pressure: ${input.soilPressure} Pa,
          Risk: ${riskPercentage}%`,
          riskLevel: "HIGH"
        });

        broadcastAlert(alert);

        // await sendSMS(
        //   "+919233082979",
        //   `🚨 Landslide Alert! High risk detected. Rainfall: ${input.rainfall}mm, Tilt: ${input.tiltAngle}°. Please take precautions immediately.`
        // );
      }

      res.status(201).json(sensor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.map.list.path, async (req, res) => {
    const locations = await storage.getLocations();
    res.json(locations);
  });

  app.post(api.map.create.path, async (req, res) => {
    try {
      const input = api.map.create.input.parse(req.body);
      const location = await storage.createLocation(input);
      res.status(201).json(location);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.alerts.list.path, async (req, res) => {
    const alerts = await storage.getAlerts();
    res.json(alerts);
  });

  app.post(api.alerts.create.path, async (req, res) => {
    try {
      const input = api.alerts.create.input.parse(req.body);
      const alert = await storage.createAlert(input);
      broadcastAlert(alert);
      res.status(201).json(alert);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });
  app.post("/api/emergency-broadcast", async (req, res) => {
    try {
      const { locationName, message } = req.body;

      if (!locationName || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const finalMessage = `
🚨 EMERGENCY ALERT 🚨
Location: ${locationName}

${message}
`;

      console.log("Sending Emergency Broadcast...");

      // 🔥 Send SMS via Twilio
      for (const number of emergencyNumbers) {
        await sendSMS(number, finalMessage);
      }

      // 🔴 Emit real-time alert to dashboard
      // ✅ Save to database first
      const alert = await storage.createAlert({
        locationName,
        message: finalMessage,
        riskLevel: "HIGH"
      });

      // ✅ Then broadcast properly
      broadcastAlert(alert);

      res.json({ success: true });

    } catch (err) {
      console.error("Emergency broadcast failed:", err);
      res.status(500).json({ message: "Broadcast failed" });
    }
  });
  // Initial seed data
  setTimeout(async () => {
    try {
      const existing = await storage.getLocations();
      if (existing.length === 0) {
        await storage.createLocation({ name: "Tupul", latitude: 24.8, longitude: 93.6, riskLevel: "HIGH", riskPercentage: 88 });
        await storage.createLocation({ name: "Awangkhul", latitude: 24.85, longitude: 93.65, riskLevel: "MODERATE", riskPercentage: 45 });
        await storage.createLocation({ name: "Oinamlong", latitude: 24.9, longitude: 93.7, riskLevel: "SAFE", riskPercentage: 12 });
      }

      const existingSensors = await storage.getSensorHistory(1);
      if (existingSensors.length === 0) {
        await storage.createSensor({
          locationName: "Tupul",   // 👈 ADD THIS
          rainfall: true,
          soilMoisture: 40.2,
          tiltAngle: 2.1,
          soilPressure: 5000,
          riskPercentage: 15,
          riskLevel: "SAFE"
        });
      }

      const existingAlerts = await storage.getAlerts();
      if (existingAlerts.length === 0) {
        await storage.createAlert({
          locationName: "System Initialization",
          message: "Landslide Monitoring System initialized successfully.",
          riskLevel: "SAFE"
        });
      }
    } catch (e) {
      console.error("Failed to seed db:", e);
    }
  }, 2000);
  app.post("/api/dispatch", async (req, res) => {
    try {
      const { locationName, riskLevel, latitude, longitude, message, dispatchTo } = req.body;

      if (!locationName || !dispatchTo) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const dispatchId = `DSP-${Date.now()}`;
      const timestamp = new Date().toLocaleString();

      const doc = new PDFDocument();
      const chunks: any[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=Dispatch_Report_${dispatchId}.pdf`
        );
        res.send(pdfBuffer);
      });

      doc.fontSize(20).text("GOVERNMENT OF MANIPUR", { align: "center" });
      doc.fontSize(14).text("Department of Disaster Management", { align: "center" });
      doc.moveDown();

      doc.fontSize(16).text("OFFICIAL EMERGENCY RESPONSE DEPLOYMENT ORDER", {
        align: "center",
        underline: true,
      });
      doc.moveDown(2);

      doc.fontSize(12).text(`Dispatch Order No: ${dispatchId}`);
      doc.text(`Date & Time: ${timestamp}`);
      doc.moveDown();

      doc.text(`Incident Location: ${locationName}`);
      doc.text(`Geographical Coordinates:`);
      doc.text(`   Latitude: ${latitude}`);
      doc.text(`   Longitude: ${longitude}`);
      doc.moveDown();

      doc.text(`Threat Classification: ${riskLevel}`);
      doc.moveDown();

      doc.text("Subject: Immediate Deployment of Emergency Response Team");
      doc.moveDown();

      doc.text(
        `In view of the elevated landslide threat assessment at the above-mentioned location,`
      );
      doc.text(
        `the assigned response authority is hereby directed to mobilize personnel and`
      );
      doc.text(
        `necessary equipment to the incident site without delay.`
      );
      doc.moveDown();

      doc.text(
        `All preventive and safety protocols must be strictly adhered to in order`
      );
      doc.text(
        `to safeguard human life, infrastructure, and surrounding areas.`
      );
      doc.moveDown(2);

      doc.text("Mandatory Equipment & Operational Kit to be Carried:");
      doc.moveDown(0.5);

      doc.text("• Personal Protective Equipment (Helmets, Gloves, Reflective Jackets)");
      doc.text("• First Aid & Trauma Medical Kit");
      doc.text("• Search & Rescue Tools (Ropes, Shovels, Cutting Tools)");
      doc.text("• Communication Devices (Wireless / Satellite Phones)");
      doc.text("• Portable Lighting Equipment");
      doc.text("• Emergency Evacuation Support Equipment");
      doc.moveDown(2);

      doc.text(`Assigned Response Authority: ${dispatchTo}`);
      doc.moveDown();

      doc.text("Issued By:");
      doc.text("Landslide Monitoring & Early Warning System");
      doc.text("Department of Disaster Management, Government of Manipur");
      doc.moveDown(3);

      doc.text("Authorized Signature: ________________________________");
      doc.text("Official Seal: _______________________________________");
      doc.end();

    } catch (err) {
      console.error("Dispatch error:", err);
      res.status(500).json({ message: "Dispatch failed" });
    }
  });
  return httpServer;
}
