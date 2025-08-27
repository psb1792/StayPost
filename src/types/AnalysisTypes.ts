export interface AnalysisStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export interface PensionAnalysis {
  core_style: string[];
  key_elements: string[];
  target_persona: string[];
  recommended_activities: string[];
  unsuitable_persona: string[];
  confidence_score: number;
  pablo_memo: string;
  thinking_process?: {
    customer_analysis_reasoning: string;
    activity_recommendation_reasoning: string;
    design_element_reasoning: string;
    key_insights: string;
  };
}

export interface ExtractionLog {
  timestamp: string;
  imageUrls: string[];
  analysis: PensionAnalysis;
  rawAIResponse: string;
  extractionMethod: string;
}

export interface UploadedFile {
  file: File;
  preview: string;
  uploadedImage?: {
    url: string;
    size: number;
    filename: string;
  };
}
