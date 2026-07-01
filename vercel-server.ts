import express from "express";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), "data");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(INQUIRIES_FILE)) fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), "utf-8");

app.post("/api/inquiries", (req, res) => {
  const { name, email, phone, businessType, brandName, targetStyle, budget, notes } = req.body;
  const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, "utf-8"));
  const inquiry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name, email, phone, businessType, brandName, targetStyle, budget, notes,
    status: "جديد",
    createdAt: new Date().toISOString()
  };
  inquiries.push(inquiry);
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
  res.json(inquiry);
});

app.get("/api/inquiries", (req, res) => {
  const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, "utf-8"));
  res.json(inquiries);
});

app.patch("/api/inquiries/:id", (req, res) => {
  const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, "utf-8"));
  const idx = inquiries.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  inquiries[idx] = { ...inquiries[idx], ...req.body };
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
  res.json(inquiries[idx]);
});

app.delete("/api/inquiries/:id", (req, res) => {
  let inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, "utf-8"));
  inquiries = inquiries.filter(i => i.id !== req.params.id);
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
  res.json({ success: true });
});

app.use(express.static(path.join(process.cwd(), "dist")));
app.get("*", (req, res) => res.sendFile(path.join(process.cwd(), "dist", "index.html")));

export default app;
