#!/usr/bin/env node

/**
 * AI Training Data Processor
 * 
 * 이미지 분석 데이터를 AI 모델 학습용으로 정리하고
 * GPT-4o 멀티모달 학습에 최적화하며
 * Canva AI 기능 개발을 위한 학습 데이터셋을 만드는 통합 스크립트
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AITrainingDataProcessor {
    constructor() {
        this.baseDir = path.join(__dirname, '..', 'data', 'ai-training');
        this.outputDir = path.join(__dirname, '..', 'data', 'processed-training-data');
        this.stats = {
            processed: 0,
            errors: 0,
            outputFiles: []
        };
    }

    /**
     * 메인 처리 함수
     */
    async processAllData() {
        console.log('🚀 AI Training Data Processor 시작...\n');
        
        try {
            // 출력 디렉토리 생성
            await this.ensureOutputDirectory();
            
            // 1. 스타일 추출 데이터 처리
            await this.processStyleExtractions();
            
            // 2. 이미지 분석 데이터 처리
            await this.processImageAnalyses();
            
            // 3. 캡션 생성 데이터 처리
            await this.processCaptionGenerations();
            
            // 4. 사용자 상호작용 데이터 처리
            await this.processUserInteractions();
            
            // 5. 통합 데이터셋 생성
            await this.createIntegratedDataset();
            
            // 6. 통계 및 메타데이터 생성
            await this.generateMetadata();
            
            console.log('\n✅ 모든 데이터 처리 완료!');
            this.printStats();
            
        } catch (error) {
            console.error('❌ 처리 중 오류 발생:', error);
            process.exit(1);
        }
    }

    /**
     * 출력 디렉토리 생성
     */
    async ensureOutputDirectory() {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
            console.log('📁 출력 디렉토리 생성 완료');
        } catch (error) {
            console.error('출력 디렉토리 생성 실패:', error);
        }
    }

    /**
     * 스타일 추출 데이터 처리
     */
    async processStyleExtractions() {
        console.log('\n🎨 스타일 추출 데이터 처리 중...');
        
        const styleDir = path.join(this.baseDir, 'style-extractions');
        const outputPath = path.join(this.outputDir, 'style-extractions.jsonl');
        
        const processedData = [];
        
        try {
            const designIntentsDir = path.join(styleDir, 'design-intents');
            const files = await this.getJsonFiles(designIntentsDir);
            
            for (const file of files) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processStyleExtractionData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`스타일 추출 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // JSONL 형식으로 저장
            await this.saveJsonlFile(outputPath, processedData);
            this.stats.outputFiles.push(outputPath);
            
            console.log(`✅ 스타일 추출 데이터 처리 완료: ${processedData.length}개 항목`);
            
        } catch (error) {
            console.error('스타일 추출 데이터 처리 실패:', error);
        }
    }

    /**
     * 이미지 분석 데이터 처리
     */
    async processImageAnalyses() {
        console.log('\n🖼️ 이미지 분석 데이터 처리 중...');
        
        const analysesDir = path.join(this.baseDir, 'image-analyses');
        const outputPath = path.join(this.outputDir, 'image-analyses.jsonl');
        
        const processedData = [];
        
        try {
            // 시각적 요소 분석
            const visualElementsDir = path.join(analysesDir, 'visual-elements');
            const visualFiles = await this.getJsonFiles(visualElementsDir);
            
            for (const file of visualFiles) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processVisualElementsData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`시각적 요소 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // 내용 분석
            const contentAnalysisDir = path.join(analysesDir, 'content-analysis');
            const contentFiles = await this.getJsonFiles(contentAnalysisDir);
            
            for (const file of contentFiles) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processContentAnalysisData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`내용 분석 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // 적합성 점수
            const suitabilityDir = path.join(analysesDir, 'suitability-scores');
            const suitabilityFiles = await this.getJsonFiles(suitabilityDir);
            
            for (const file of suitabilityFiles) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processSuitabilityData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`적합성 점수 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // JSONL 형식으로 저장
            await this.saveJsonlFile(outputPath, processedData);
            this.stats.outputFiles.push(outputPath);
            
            console.log(`✅ 이미지 분석 데이터 처리 완료: ${processedData.length}개 항목`);
            
        } catch (error) {
            console.error('이미지 분석 데이터 처리 실패:', error);
        }
    }

    /**
     * 캡션 생성 데이터 처리
     */
    async processCaptionGenerations() {
        console.log('\n📝 캡션 생성 데이터 처리 중...');
        
        const captionsDir = path.join(this.baseDir, 'caption-generations');
        const outputPath = path.join(this.outputDir, 'caption-generations.jsonl');
        
        const processedData = [];
        
        try {
            // 성공한 캡션
            const successfulDir = path.join(captionsDir, 'successful-captions');
            const successfulFiles = await this.getJsonFiles(successfulDir);
            
            for (const file of successfulFiles) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processSuccessfulCaptionData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`성공한 캡션 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // 실패한 캡션
            const failedDir = path.join(captionsDir, 'failed-captions');
            const failedFiles = await this.getJsonFiles(failedDir);
            
            for (const file of failedFiles) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processFailedCaptionData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`실패한 캡션 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // 스타일 변형
            const styleVariationsDir = path.join(captionsDir, 'style-variations');
            const styleFiles = await this.getJsonFiles(styleVariationsDir);
            
            for (const file of styleFiles) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processStyleVariationData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`스타일 변형 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // JSONL 형식으로 저장
            await this.saveJsonlFile(outputPath, processedData);
            this.stats.outputFiles.push(outputPath);
            
            console.log(`✅ 캡션 생성 데이터 처리 완료: ${processedData.length}개 항목`);
            
        } catch (error) {
            console.error('캡션 생성 데이터 처리 실패:', error);
        }
    }

    /**
     * 사용자 상호작용 데이터 처리
     */
    async processUserInteractions() {
        console.log('\n👥 사용자 상호작용 데이터 처리 중...');
        
        const interactionsDir = path.join(this.baseDir, 'user-interactions');
        const outputPath = path.join(this.outputDir, 'user-interactions.jsonl');
        
        const processedData = [];
        
        try {
            // 피드백 점수
            const feedbackDir = path.join(interactionsDir, 'feedback-scores');
            const feedbackFiles = await this.getJsonFiles(feedbackDir);
            
            for (const file of feedbackFiles) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processFeedbackData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`피드백 점수 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // 사용 패턴
            const usageDir = path.join(interactionsDir, 'usage-patterns');
            const usageFiles = await this.getJsonFiles(usageDir);
            
            for (const file of usageFiles) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processUsagePatternData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`사용 패턴 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // 사용자 선호도
            const preferencesDir = path.join(interactionsDir, 'user-preferences');
            const preferencesFiles = await this.getJsonFiles(preferencesDir);
            
            for (const file of preferencesFiles) {
                try {
                    const data = await this.readJsonFile(file);
                    const processed = this.processUserPreferencesData(data, file);
                    if (processed) {
                        processedData.push(processed);
                        this.stats.processed++;
                    }
                } catch (error) {
                    console.error(`사용자 선호도 파일 처리 실패: ${file}`, error.message);
                    this.stats.errors++;
                }
            }
            
            // JSONL 형식으로 저장
            await this.saveJsonlFile(outputPath, processedData);
            this.stats.outputFiles.push(outputPath);
            
            console.log(`✅ 사용자 상호작용 데이터 처리 완료: ${processedData.length}개 항목`);
            
        } catch (error) {
            console.error('사용자 상호작용 데이터 처리 실패:', error);
        }
    }

    /**
     * 통합 데이터셋 생성
     */
    async createIntegratedDataset() {
        console.log('\n🔗 통합 데이터셋 생성 중...');
        
        const integratedPath = path.join(this.outputDir, 'integrated-dataset.jsonl');
        const canvaAIPath = path.join(this.outputDir, 'canva-ai-dataset.jsonl');
        const gpt4oPath = path.join(this.outputDir, 'gpt4o-multimodal-dataset.jsonl');
        
        try {
            // 모든 처리된 데이터 수집
            const allData = [];
            
            const files = [
                'style-extractions.jsonl',
                'image-analyses.jsonl',
                'caption-generations.jsonl',
                'user-interactions.jsonl'
            ];
            
            for (const file of files) {
                const filePath = path.join(this.outputDir, file);
                try {
                    const data = await this.readJsonlFile(filePath);
                    allData.push(...data);
                } catch (error) {
                    console.warn(`파일 읽기 실패: ${file}`, error.message);
                }
            }
            
            // 통합 데이터셋 저장
            await this.saveJsonlFile(integratedPath, allData);
            this.stats.outputFiles.push(integratedPath);
            
            // Canva AI 전용 데이터셋 생성
            const canvaAIData = this.createCanvaAIDataset(allData);
            await this.saveJsonlFile(canvaAIPath, canvaAIData);
            this.stats.outputFiles.push(canvaAIPath);
            
            // GPT-4o 멀티모달 전용 데이터셋 생성
            const gpt4oData = this.createGPT4oDataset(allData);
            await this.saveJsonlFile(gpt4oPath, gpt4oData);
            this.stats.outputFiles.push(gpt4oPath);
            
            console.log(`✅ 통합 데이터셋 생성 완료: ${allData.length}개 항목`);
            
        } catch (error) {
            console.error('통합 데이터셋 생성 실패:', error);
        }
    }

    /**
     * 스타일 추출 데이터 처리
     */
    processStyleExtractionData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'style_extraction',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'design_intent',
                content: {
                    image_url: data.imageUrl || null,
                    style_analysis: {
                        colors: data.colors || [],
                        typography: data.typography || {},
                        layout: data.layout || {},
                        mood: data.mood || '',
                        target_audience: data.targetAudience || '',
                        brand_guidelines: data.brandGuidelines || {}
                    },
                    extracted_features: data.extractedFeatures || [],
                    confidence_scores: data.confidenceScores || {}
                },
                metadata: {
                    processing_version: '1.0',
                    model_version: data.modelVersion || 'unknown',
                    extraction_method: data.extractionMethod || 'auto'
                }
            };
        } catch (error) {
            console.error('스타일 추출 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * 시각적 요소 데이터 처리
     */
    processVisualElementsData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'visual_elements',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'image_analysis',
                content: {
                    image_url: data.imageUrl || null,
                    visual_elements: {
                        objects: data.objects || [],
                        colors: data.colors || [],
                        composition: data.composition || {},
                        textures: data.textures || [],
                        patterns: data.patterns || []
                    },
                    analysis_results: data.analysisResults || {},
                    confidence_scores: data.confidenceScores || {}
                },
                metadata: {
                    processing_version: '1.0',
                    analysis_model: data.analysisModel || 'unknown'
                }
            };
        } catch (error) {
            console.error('시각적 요소 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * 내용 분석 데이터 처리
     */
    processContentAnalysisData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'content_analysis',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'image_analysis',
                content: {
                    image_url: data.imageUrl || null,
                    content_analysis: {
                        subjects: data.subjects || [],
                        themes: data.themes || [],
                        emotions: data.emotions || [],
                        context: data.context || '',
                        cultural_elements: data.culturalElements || []
                    },
                    analysis_results: data.analysisResults || {},
                    relevance_scores: data.relevanceScores || {}
                },
                metadata: {
                    processing_version: '1.0',
                    analysis_model: data.analysisModel || 'unknown'
                }
            };
        } catch (error) {
            console.error('내용 분석 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * 적합성 점수 데이터 처리
     */
    processSuitabilityData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'suitability_score',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'image_analysis',
                content: {
                    image_url: data.imageUrl || null,
                    suitability_analysis: {
                        overall_score: data.overallScore || 0,
                        category_scores: data.categoryScores || {},
                        recommendations: data.recommendations || [],
                        risk_factors: data.riskFactors || []
                    },
                    evaluation_criteria: data.evaluationCriteria || {},
                    confidence_scores: data.confidenceScores || {}
                },
                metadata: {
                    processing_version: '1.0',
                    evaluation_model: data.evaluationModel || 'unknown'
                }
            };
        } catch (error) {
            console.error('적합성 점수 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * 성공한 캡션 데이터 처리
     */
    processSuccessfulCaptionData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'successful_caption',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'caption_generation',
                content: {
                    image_url: data.imageUrl || null,
                    generated_caption: data.generatedCaption || '',
                    style_parameters: data.styleParameters || {},
                    generation_context: data.generationContext || {},
                    success_metrics: data.successMetrics || {}
                },
                metadata: {
                    processing_version: '1.0',
                    generation_model: data.generationModel || 'unknown',
                    success_rate: data.successRate || 1.0
                }
            };
        } catch (error) {
            console.error('성공한 캡션 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * 실패한 캡션 데이터 처리
     */
    processFailedCaptionData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'failed_caption',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'caption_generation',
                content: {
                    image_url: data.imageUrl || null,
                    attempted_caption: data.attemptedCaption || '',
                    error_details: data.errorDetails || {},
                    failure_reason: data.failureReason || '',
                    suggested_fixes: data.suggestedFixes || []
                },
                metadata: {
                    processing_version: '1.0',
                    generation_model: data.generationModel || 'unknown',
                    failure_type: data.failureType || 'unknown'
                }
            };
        } catch (error) {
            console.error('실패한 캡션 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * 스타일 변형 데이터 처리
     */
    processStyleVariationData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'style_variation',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'caption_generation',
                content: {
                    image_url: data.imageUrl || null,
                    base_caption: data.baseCaption || '',
                    style_variations: data.styleVariations || [],
                    style_parameters: data.styleParameters || {},
                    variation_metrics: data.variationMetrics || {}
                },
                metadata: {
                    processing_version: '1.0',
                    generation_model: data.generationModel || 'unknown',
                    variation_count: data.variationCount || 0
                }
            };
        } catch (error) {
            console.error('스타일 변형 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * 피드백 데이터 처리
     */
    processFeedbackData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'feedback_score',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'user_interaction',
                content: {
                    user_id: data.userId || 'anonymous',
                    feedback_scores: data.feedbackScores || {},
                    feedback_text: data.feedbackText || '',
                    interaction_context: data.interactionContext || {},
                    improvement_suggestions: data.improvementSuggestions || []
                },
                metadata: {
                    processing_version: '1.0',
                    feedback_type: data.feedbackType || 'general',
                    rating_scale: data.ratingScale || '1-5'
                }
            };
        } catch (error) {
            console.error('피드백 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * 사용 패턴 데이터 처리
     */
    processUsagePatternData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'usage_pattern',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'user_interaction',
                content: {
                    user_id: data.userId || 'anonymous',
                    usage_patterns: data.usagePatterns || {},
                    feature_usage: data.featureUsage || {},
                    session_data: data.sessionData || {},
                    performance_metrics: data.performanceMetrics || {}
                },
                metadata: {
                    processing_version: '1.0',
                    tracking_period: data.trackingPeriod || 'unknown',
                    data_granularity: data.dataGranularity || 'session'
                }
            };
        } catch (error) {
            console.error('사용 패턴 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * 사용자 선호도 데이터 처리
     */
    processUserPreferencesData(data, filePath) {
        try {
            const fileName = path.basename(filePath);
            const timestamp = data.timestamp || new Date().toISOString();
            
            return {
                id: this.generateId(),
                type: 'user_preferences',
                timestamp: timestamp,
                source_file: fileName,
                data_type: 'user_interaction',
                content: {
                    user_id: data.userId || 'anonymous',
                    style_preferences: data.stylePreferences || {},
                    content_preferences: data.contentPreferences || {},
                    interaction_preferences: data.interactionPreferences || {},
                    customization_settings: data.customizationSettings || {}
                },
                metadata: {
                    processing_version: '1.0',
                    preference_source: data.preferenceSource || 'explicit',
                    last_updated: data.lastUpdated || timestamp
                }
            };
        } catch (error) {
            console.error('사용자 선호도 데이터 처리 실패:', error);
            return null;
        }
    }

    /**
     * Canva AI 전용 데이터셋 생성
     */
    createCanvaAIDataset(allData) {
        return allData.map(item => ({
            ...item,
            canva_ai_format: {
                design_context: this.extractDesignContext(item),
                style_guidelines: this.extractStyleGuidelines(item),
                content_recommendations: this.extractContentRecommendations(item),
                user_preferences: this.extractUserPreferences(item),
                generation_parameters: this.extractGenerationParameters(item)
            }
        }));
    }

    /**
     * GPT-4o 멀티모달 전용 데이터셋 생성
     */
    createGPT4oDataset(allData) {
        return allData.map(item => ({
            ...item,
            gpt4o_multimodal_format: {
                image_description: this.createImageDescription(item),
                text_prompt: this.createTextPrompt(item),
                expected_output: this.createExpectedOutput(item),
                context_information: this.createContextInformation(item),
                evaluation_criteria: this.createEvaluationCriteria(item)
            }
        }));
    }

    /**
     * 디자인 컨텍스트 추출
     */
    extractDesignContext(item) {
        const context = {
            image_analysis: null,
            style_analysis: null,
            content_analysis: null
        };

        if (item.content?.style_analysis) {
            context.style_analysis = item.content.style_analysis;
        }
        if (item.content?.visual_elements) {
            context.image_analysis = item.content.visual_elements;
        }
        if (item.content?.content_analysis) {
            context.content_analysis = item.content.content_analysis;
        }

        return context;
    }

    /**
     * 스타일 가이드라인 추출
     */
    extractStyleGuidelines(item) {
        if (item.content?.style_analysis) {
            return {
                colors: item.content.style_analysis.colors,
                typography: item.content.style_analysis.typography,
                layout: item.content.style_analysis.layout,
                mood: item.content.style_analysis.mood
            };
        }
        return null;
    }

    /**
     * 콘텐츠 추천사항 추출
     */
    extractContentRecommendations(item) {
        if (item.content?.suitability_analysis?.recommendations) {
            return item.content.suitability_analysis.recommendations;
        }
        return [];
    }

    /**
     * 사용자 선호도 추출
     */
    extractUserPreferences(item) {
        if (item.content?.style_preferences) {
            return item.content.style_preferences;
        }
        return null;
    }

    /**
     * 생성 파라미터 추출
     */
    extractGenerationParameters(item) {
        if (item.content?.style_parameters) {
            return item.content.style_parameters;
        }
        return {};
    }

    /**
     * 이미지 설명 생성
     */
    createImageDescription(item) {
        const descriptions = [];
        
        if (item.content?.visual_elements?.objects) {
            descriptions.push(`Objects: ${item.content.visual_elements.objects.join(', ')}`);
        }
        if (item.content?.visual_elements?.colors) {
            descriptions.push(`Colors: ${item.content.visual_elements.colors.join(', ')}`);
        }
        if (item.content?.content_analysis?.subjects) {
            descriptions.push(`Subjects: ${item.content.content_analysis.subjects.join(', ')}`);
        }
        
        return descriptions.join('. ');
    }

    /**
     * 텍스트 프롬프트 생성
     */
    createTextPrompt(item) {
        const prompts = [];
        
        if (item.content?.generated_caption) {
            prompts.push(`Generate a caption: ${item.content.generated_caption}`);
        }
        if (item.content?.style_analysis?.mood) {
            prompts.push(`Mood: ${item.content.style_analysis.mood}`);
        }
        if (item.content?.content_analysis?.themes) {
            prompts.push(`Themes: ${item.content.content_analysis.themes.join(', ')}`);
        }
        
        return prompts.join('. ');
    }

    /**
     * 예상 출력 생성
     */
    createExpectedOutput(item) {
        if (item.type === 'successful_caption') {
            return {
                type: 'caption',
                content: item.content.generated_caption,
                style: item.content.style_parameters
            };
        }
        return null;
    }

    /**
     * 컨텍스트 정보 생성
     */
    createContextInformation(item) {
        return {
            data_type: item.data_type,
            timestamp: item.timestamp,
            source_file: item.source_file,
            confidence_scores: item.content?.confidence_scores || {}
        };
    }

    /**
     * 평가 기준 생성
     */
    createEvaluationCriteria(item) {
        if (item.content?.suitability_analysis) {
            return {
                overall_score: item.content.suitability_analysis.overall_score,
                category_scores: item.content.suitability_analysis.category_scores,
                recommendations: item.content.suitability_analysis.recommendations
            };
        }
        return null;
    }

    /**
     * JSON 파일 목록 가져오기
     */
    async getJsonFiles(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            return files
                .filter(file => file.endsWith('.json'))
                .map(file => path.join(dirPath, file));
        } catch (error) {
            console.warn(`디렉토리 읽기 실패: ${dirPath}`, error.message);
            return [];
        }
    }

    /**
     * JSON 파일 읽기
     */
    async readJsonFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    }

    /**
     * JSONL 파일 읽기
     */
    async readJsonlFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        return content
            .split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
    }

    /**
     * JSONL 파일 저장
     */
    async saveJsonlFile(filePath, data) {
        const jsonlContent = data
            .map(item => JSON.stringify(item))
            .join('\n');
        await fs.writeFile(filePath, jsonlContent, 'utf8');
    }

    /**
     * 고유 ID 생성
     */
    generateId() {
        return crypto.randomUUID();
    }

    /**
     * 메타데이터 생성
     */
    async generateMetadata() {
        const metadata = {
            processing_info: {
                timestamp: new Date().toISOString(),
                processor_version: '1.0.0',
                total_processed: this.stats.processed,
                total_errors: this.stats.errors,
                output_files: this.stats.outputFiles
            },
            dataset_info: {
                description: 'AI Training Data for GPT-4o Multimodal and Canva AI Development',
                data_types: [
                    'style_extraction',
                    'image_analysis',
                    'caption_generation',
                    'user_interaction'
                ],
                formats: [
                    'jsonl',
                    'integrated_dataset',
                    'canva_ai_dataset',
                    'gpt4o_multimodal_dataset'
                ]
            },
            usage_instructions: {
                gpt4o_multimodal: 'Use for training GPT-4o multimodal models with image-text pairs',
                canva_ai: 'Use for developing Canva AI features with design context and user preferences',
                general: 'Use for general AI model training and research'
            }
        };

        const metadataPath = path.join(this.outputDir, 'metadata.json');
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
        this.stats.outputFiles.push(metadataPath);
    }

    /**
     * 통계 출력
     */
    printStats() {
        console.log('\n📊 처리 통계:');
        console.log(`- 처리된 항목: ${this.stats.processed}개`);
        console.log(`- 오류 발생: ${this.stats.errors}개`);
        console.log(`- 생성된 파일: ${this.stats.outputFiles.length}개`);
        
        console.log('\n📁 생성된 파일:');
        this.stats.outputFiles.forEach(file => {
            console.log(`  - ${path.basename(file)}`);
        });
        
        console.log('\n🎯 사용 방법:');
        console.log('1. GPT-4o 멀티모달 학습: gpt4o-multimodal-dataset.jsonl 사용');
        console.log('2. Canva AI 기능 개발: canva-ai-dataset.jsonl 사용');
        console.log('3. 일반 AI 모델 학습: integrated-dataset.jsonl 사용');
    }
}

// 스크립트 실행
const processor = new AITrainingDataProcessor();
processor.processAllData().catch(console.error);

export default AITrainingDataProcessor;
