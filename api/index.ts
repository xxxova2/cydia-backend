import express from "express";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json({ limit: '10mb' }));

const INQUIRIES_FILE = path.join("/tmp", "inquiries.json");
try { if (!fs.existsSync(INQUIRIES_FILE)) fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2)); } catch(e) {}

app.post("/api/inquiries", (req, res) => {
  const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, "utf-8"));
  const inquiry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,7), ...req.body, status: "جديد", createdAt: new Date().toISOString() };
  inquiries.push(inquiry);
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
  res.json(inquiry);
});

app.get("/api/inquiries", (req, res) => res.json(JSON.parse(fs.readFileSync(INQUIRIES_FILE, "utf-8"))));
app.patch("/api/inquiries/:id", (req, res) => {
  const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, "utf-8"));
  const idx = inquiries.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  inquiries[idx] = { ...inquiries[idx], ...req.body };
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
  res.json(inquiries[idx]);
});
app.delete("/api/inquiries/:id", (req, res) => {
  let inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, "utf-8"));
  inquiries = inquiries.filter(i => i.id !== req.params.id);
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../dist", "index.html")));

export default app;
