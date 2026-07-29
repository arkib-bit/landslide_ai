import { pgTable, text, serial, integer, doublePrecision, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- SENSORS ---
export const sensors = pgTable("sensors", {
  id: serial("id").primaryKey(),
  locationName: text("location_name").notNull(),
  rainfall: boolean("rainfall").notNull(),
  soilMoisture: doublePrecision("soil_moisture").notNull(),
  tiltAngle: doublePrecision("tilt_angle").notNull(),
  soilPressure: doublePrecision("soil_pressure").notNull(),
  riskPercentage: integer("risk_percentage"),
  riskLevel: text("risk_level"), // SAFE, MODERATE, HIGH
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertSensorSchema = createInsertSchema(sensors).omit({
  id: true,
  timestamp: true,
  riskPercentage: true, // Calculated by ML service
  riskLevel: true // Calculated by ML service
});

export type Sensor = typeof sensors.$inferSelect;
export type InsertSensor = z.infer<typeof insertSensorSchema>;

// --- MAP LOCATIONS ---
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  riskLevel: text("risk_level").notNull().default('SAFE'), // SAFE, MODERATE, HIGH
  riskPercentage: integer("risk_percentage").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  lastUpdated: true
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

// --- ALERTS ---
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  locationName: text("location_name").notNull(),
  message: text("message").notNull(),
  riskLevel: text("risk_level").notNull(), // SAFE, MODERATE, HIGH
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
