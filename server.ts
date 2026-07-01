import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure inquiries storage directory and file exist
const DATA_DIR = path.join(process.cwd(), "data");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), "utf-8");
}

// Read inquiries from storage file
const getInquiries = (): any[] => {
  try {
    const data = fs.readFileSync(INQUIRIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading inquiries file", err);
    return [];
  }
};

// Save inquiries to storage file
const saveInquiries = (inquiries: any[]) => {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing inquiries file", err);
  }
};

// API: Submit a consultation inquiry
app.post("/api/inquiries", (req, res) => {
  const { name, email, phone, businessType, brandName, targetStyle, budget, notes } = req.body;
  
  if (!name || !email || !phone) {
    res.status(400).json({ error: "الرجاء تعبئة الحقول الأساسية: الاسم، البريد الإلكتروني، ورقم الجوال" });
    return;
  }

  const inquiries = getInquiries();
  const newInquiry = {
    id: `inq_${Date.now()}`,
    name,
    email,
    phone,
    businessType: businessType || "غير محدد",
    brandName: brandName || "غير محدد",
    targetStyle: targetStyle || "فخم كلاسيكي",
    budget: budget || "غير محدد",
    notes: notes || "",
    status: "تحت المراجعة",
    createdAt: new Date().toISOString(),
  };

  inquiries.push(newInquiry);
  saveInquiries(inquiries);

  res.status(201).json({ success: true, message: "تم إرسال طلبك بنجاح! سنتواصل معك خلال ٢٤ ساعة.", inquiry: newInquiry });
});

// API: Get inquiries (for Admin Dashboard)
app.get("/api/inquiries", (req, res) => {
  const inquiries = getInquiries();
  // Return sorted by date descending
  const sorted = [...inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sorted);
});

// API: Update inquiry status
app.patch("/api/inquiries/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: "حالة الطلب مطلوبة" });
    return;
  }

  const inquiries = getInquiries();
  const index = inquiries.findIndex(inq => inq.id === id);

  if (index === -1) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  inquiries[index].status = status;
  saveInquiries(inquiries);

  res.json({ success: true, inquiry: inquiries[index] });
});

// API: Delete inquiry
app.delete("/api/inquiries/:id", (req, res) => {
  const { id } = req.params;
  const inquiries = getInquiries();
  const filtered = inquiries.filter(inq => inq.id !== id);

  if (inquiries.length === filtered.length) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  saveInquiries(filtered);
  res.json({ success: true, message: "تم حذف الطلب بنجاح" });
});

// API: Generate Store Design Proposal using Gemini AI
app.post("/api/consult", async (req, res) => {
  const { businessType, brandName, targetStyle, notes } = req.body;

  if (!businessType) {
    res.status(400).json({ error: "الرجاء تحديد نوع النشاط أو المتجر" });
    return;
  }

  const formattedBrand = brandName ? `باسم "${brandName}"` : "بدون اسم محدد بعد";

  const prompt = `أنت مصمم ومطور ويب ومتاجر الكترونية محترف جداً، تعمل بهوية "CYDIA BACKEND".
تقوم بمساعدة العميل لتخطيط متجره الإلكتروني الفخم والسريع خلال 3 أيام.
صمم خطة متكاملة ومقترح تصميمي مذهل لمتجر إلكتروني يبيع: "${businessType}" ${formattedBrand}.
الأسلوب البصري المستهدف: "${targetStyle || "فخم كلاسيكي"}".
تفاصيل إضافية من العميل: "${notes || "لا توجد تفاصيل إضافية"}".

يرجى توليد الاستجابة باللغة العربية الفصحى الفاخرة والمناسبة للسوق الرفيع.
يجب أن ترجع النتيجة ككائن JSON دقيق يحتوي على الحقول التالية:
1. slogan: شعار لفظي تسويقي بليغ وجذاب جداً للمتجر.
2. brandStory: قصة أو وصف للماركة يعبر عن الفخامة والجودة العالية.
3. recommendedColors: مصفوفة من 3 ألوان متناسقة تناسب هذا الأسلوب بالهيكس (مثل #1A1500, #F5D061, #FFFFFF) مع توضيح استخدام كل لون في تصميم الموقع.
4. storeSections: مصفوفة من 4 أقسام رئيسية لصفحة الهبوط (مثال: الهيرو بنر، المنتجات الأكثر طلباً، قصة العطر الفاخر، آراء عملاء النخبة). كل قسم يجب أن يحتوي على title (عنوان) و layout (طريقة العرض المقترحة) و description (ماذا يعرض هذا القسم بالتفصيل).
5. launchChecklist: مصفوفة من 6 خطوات موزعة على 3 أيام تمكن العميل من الإطلاق الفعلي والسريع (اليوم الأول خطوتان، اليوم الثاني خطوتان، اليوم الثالث خطوتان)، مع ذكر تفاصيل تناسب السوق (مثل الربط مع مدى أو تمارا أو شركات الشحن كأرامكس).
6. marketingCopy: مصفوفة من 3 تغريدات أو منشورات تسويقية جاهزة ومؤثرة جداً لجذب الجمهور.
7. expertBudget: تقدير تقريبي للميزانية بالريال (SAR) لخيارات التنفيذ (على منصة سلة/زد كباقة جاهزة، أو تصميم مبرمج بالكامل كود خاص) مع تبرير احترافي لكل خيار.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "slogan",
            "brandStory",
            "recommendedColors",
            "storeSections",
            "launchChecklist",
            "marketingCopy",
            "expertBudget"
          ],
          properties: {
            slogan: {
              type: Type.STRING,
              description: "A short, highly impactful Arabic brand slogan/tagline."
            },
            brandStory: {
              type: Type.STRING,
              description: "A premium, beautifully written story of the brand's identity and luxury perspective."
            },
            recommendedColors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["hex", "useInDesign"],
                properties: {
                  hex: { type: Type.STRING, description: "The hexadecimal color code, e.g. #D4AF37" },
                  useInDesign: { type: Type.STRING, description: "Where and how to use this color, e.g. الخلفية الأساسية للموقع" }
                }
              }
            },
            storeSections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "layout", "description"],
                properties: {
                  title: { type: Type.STRING, description: "Title of the visual section" },
                  layout: { type: Type.STRING, description: "Recommended layout structure" },
                  description: { type: Type.STRING, description: "Detailed description of contents and interactive behaviors" }
                }
              }
            },
            launchChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["day", "taskTitle", "details"],
                properties: {
                  day: { type: Type.STRING, description: "e.g. اليوم الأول" },
                  taskTitle: { type: Type.STRING, description: "The task name" },
                  details: { type: Type.STRING, description: "Step-by-step clear instructions" }
                }
              }
            },
            marketingCopy: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "Social media marketing text drafts for customers."
              }
            },
            expertBudget: {
              type: Type.OBJECT,
              required: ["sallaZidTier", "customDevTier", "designerAdvice"],
              properties: {
                sallaZidTier: { type: Type.STRING, description: "Price and feature estimate for Salla/Zid platform setups, e.g. 2,500 - 4,000 SAR" },
                customDevTier: { type: Type.STRING, description: "Price and feature estimate for complete custom code setups, e.g. 12,000 - 18,000 SAR" },
                designerAdvice: { type: Type.STRING, description: "A friendly, professional recommendation on which to choose based on the niche." }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "حدث خطأ أثناء الاتصال بمستشار الذكاء الاصطناعي. يرجى المحاولة مرة أخرى لاحقاً." });
  }
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
