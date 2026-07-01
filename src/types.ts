export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessType: string;
  brandName: string;
  targetStyle: string;
  budget: string;
  notes: string;
  status: string;
  createdAt: string;
}

export interface RecommendedColor {
  hex: string;
  useInDesign: string;
}

export interface StoreSection {
  title: string;
  layout: string;
  description: string;
}

export interface LaunchChecklist {
  day: string;
  taskTitle: string;
  details: string;
}

export interface ExpertBudget {
  sallaZidTier: string;
  customDevTier: string;
  designerAdvice: string;
}

export interface Proposal {
  slogan: string;
  brandStory: string;
  recommendedColors: RecommendedColor[];
  storeSections: StoreSection[];
  launchChecklist: LaunchChecklist[];
  marketingCopy: string[];
  expertBudget: ExpertBudget;
}
