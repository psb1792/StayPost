"""
Phase 2.2 2단계: 파라미터 + 템플릿 추천 시스템
LlamaIndex의 RouterQueryEngine을 활용한 복합 RAG 시스템
"""

import os
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from pathlib import Path

from llama_index.core import (
    VectorStoreIndex, 
    KeywordTableIndex, 
    KnowledgeGraphIndex,
    Document,
    Settings
)
from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core.tools import QueryEngineTool
from llama_index.core.selectors import PydanticSingleSelector
from llama_index.core.storage.storage_context import StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.graph_stores.neodb import Neo4jGraphStore
import chromadb
import networkx as nx

# 환경 변수 설정
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "your-openai-api-key")

@dataclass
class RecommendationRequest:
    """추천 요청 데이터"""
    user_query: str
    store_info: Dict[str, Any]
    image_summary: Optional[str] = None
    target_audience: Optional[str] = None

@dataclass
class RecommendationResult:
    """추천 결과 데이터"""
    emotion: str
    tone: str
    target: str
    template_style: str
    keywords: List[str]
    confidence_score: float
    reasoning: str
    sources: List[str]

class ParameterTemplateRecommender:
    """파라미터 + 템플릿 추천 시스템"""
    
    def __init__(self):
        self.vector_engine = None
        self.keyword_engine = None
        self.kg_engine = None
        self.router_engine = None
        self.initialized = False
        
    def initialize_indices(self):
        """인덱스들을 초기화하고 설정"""
        if self.initialized:
            return
            
        # LLM과 Embedding 모델 설정
        llm = OpenAI(model="gpt-4o-mini", temperature=0.1)
        embed_model = OpenAIEmbedding(model="text-embedding-3-small")
        
        Settings.llm = llm
        Settings.embed_model = embed_model
        
        # 1. VectorStoreIndex - 문구 스타일, 성공 사례 등 의미 기반 검색
        self._setup_vector_index()
        
        # 2. KeywordTableIndex - 금지어, 정책, 체크리스트 등 키워드 기반 검색
        self._setup_keyword_index()
        
        # 3. KnowledgeGraphIndex - 감정-톤-타겟 관계 그래프
        self._setup_knowledge_graph_index()
        
        # 4. RouterQueryEngine 설정
        self._setup_router_engine()
        
        self.initialized = True
        print("✅ 모든 인덱스가 성공적으로 초기화되었습니다.")
    
    def _setup_vector_index(self):
        """VectorStoreIndex 설정 - 의미 기반 검색용"""
        # 샘플 데이터 생성 (실제로는 DB에서 로드)
        vector_docs = [
            Document(text="따뜻하고 아늑한 느낌의 문구는 '포근함', '안락함', '편안함' 키워드를 활용하며, 부드러운 어조로 작성합니다."),
            Document(text="럭셔리한 고급스러운 문구는 '프리미엄', '독점적', '세련됨' 키워드를 사용하며, 정중하고 우아한 톤을 유지합니다."),
            Document(text="친근하고 재미있는 문구는 '즐거움', '웃음', '친구같은' 키워드를 활용하며, 편안하고 자연스러운 어조를 사용합니다."),
            Document(text="전문적이고 신뢰감 있는 문구는 '전문성', '신뢰', '경험' 키워드를 사용하며, 객관적이고 사실적인 톤을 유지합니다."),
            Document(text="감성적이고 로맨틱한 문구는 '사랑', '로맨스', '감동' 키워드를 활용하며, 따뜻하고 감성적인 어조를 사용합니다."),
        ]
        
        # ChromaDB 벡터 스토어 설정
        chroma_client = chromadb.PersistentClient(path="./chroma_db")
        chroma_collection = chroma_client.get_or_create_collection("vector_index")
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        
        self.vector_engine = VectorStoreIndex.from_documents(
            vector_docs, 
            storage_context=storage_context
        ).as_query_engine()
        
        print("✅ VectorStoreIndex 초기화 완료")
    
    def _setup_keyword_index(self):
        """KeywordTableIndex 설정 - 키워드 기반 검색용"""
        keyword_docs = [
            Document(text="금지어: 폭력적, 부적절한, 불법, 사기, 허위"),
            Document(text="필수 브랜드 태그: #펜션브랜드, #숙박업, #여행"),
            Document(text="프로모션 키워드: 할인, 이벤트, 특가, 선착순, 한정"),
            Document(text="계절별 키워드: 봄-벚꽃, 여름-바다, 가을-단풍, 겨울-눈"),
            Document(text="체크리스트: 위치, 가격, 편의시설, 리뷰, 예약가능성"),
        ]
        
        self.keyword_engine = KeywordTableIndex.from_documents(keyword_docs).as_query_engine()
        print("✅ KeywordTableIndex 초기화 완료")
    
    def _setup_knowledge_graph_index(self):
        """KnowledgeGraphIndex 설정 - 관계 추론용"""
        # 감정-톤-타겟 관계 그래프 데이터
        graph_docs = [
            Document(text="따뜻한 감정은 정중한 톤과 30-40대 여성 타겟과 잘 어울립니다."),
            Document(text="럭셔리한 감정은 고급스러운 톤과 40-50대 남성 타겟과 잘 어울립니다."),
            Document(text="친근한 감정은 편안한 톤과 20-30대 젊은 층과 잘 어울립니다."),
            Document(text="전문적인 감정은 객관적인 톤과 비즈니스 고객과 잘 어울립니다."),
            Document(text="감성적인 감정은 로맨틱한 톤과 커플 타겟과 잘 어울립니다."),
        ]
        
        # Neo4j 그래프 스토어 설정 (로컬 파일 기반으로 대체)
        self.kg_engine = KnowledgeGraphIndex.from_documents(graph_docs).as_query_engine()
        print("✅ KnowledgeGraphIndex 초기화 완료")
    
    def _setup_router_engine(self):
        """RouterQueryEngine 설정"""
        # 각 엔진을 Tool로 정의
        vector_tool = QueryEngineTool.from_defaults(
            query_engine=self.vector_engine,
            description="의미적으로 유사한 콘셉트나 스타일을 찾을 때 유용합니다. 문구 스타일, 톤앤매너 추천에 적합합니다."
        )
        
        keyword_tool = QueryEngineTool.from_defaults(
            query_engine=self.keyword_engine,
            description="프로모션이나 금지어 같은 특정 키워드를 조회할 때 유용합니다. 태그 생성, 정책 확인에 적합합니다."
        )
        
        graph_tool = QueryEngineTool.from_defaults(
            query_engine=self.kg_engine,
            description="감정, 톤, 타겟 간의 관계를 이해할 때 유용합니다. 복합적인 추천 로직에 적합합니다."
        )
        
        # 라우터 쿼리 엔진 설정
        self.router_engine = RouterQueryEngine(
            selector=PydanticSingleSelector.from_defaults(),
            query_engine_tools=[vector_tool, keyword_tool, graph_tool]
        )
        
        print("✅ RouterQueryEngine 초기화 완료")
    
    def recommend_parameters_and_template(self, request: RecommendationRequest) -> RecommendationResult:
        """파라미터와 템플릿을 추천"""
        if not self.initialized:
            self.initialize_indices()
        
        # 사용자 쿼리와 가게 정보를 조합한 검색 쿼리 생성
        search_query = self._build_search_query(request)
        
        # 라우터를 통해 최적의 도구를 선택하여 검색 수행
        response = self.router_engine.query(search_query)
        
        # 응답을 파싱하여 구조화된 결과 생성
        result = self._parse_router_response(response, request)
        
        return result
    
    def _build_search_query(self, request: RecommendationRequest) -> str:
        """검색 쿼리 생성"""
        query_parts = [
            f"사용자 요청: {request.user_query}",
            f"가게 정보: {json.dumps(request.store_info, ensure_ascii=False)}"
        ]
        
        if request.image_summary:
            query_parts.append(f"이미지 요약: {request.image_summary}")
        
        if request.target_audience:
            query_parts.append(f"타겟 고객: {request.target_audience}")
        
        return " | ".join(query_parts)
    
    def _parse_router_response(self, response, request: RecommendationRequest) -> RecommendationResult:
        """라우터 응답을 파싱하여 구조화된 결과 생성"""
        # 기본값 설정
        result = RecommendationResult(
            emotion="따뜻함",
            tone="정중함",
            target="일반 고객",
            template_style="친근하고 신뢰감 있는 스타일",
            keywords=["편안함", "신뢰", "친근함"],
            confidence_score=0.8,
            reasoning=response.response,
            sources=[str(source) for source in response.source_nodes] if response.source_nodes else []
        )
        
        # 응답에서 감정, 톤, 타겟 정보 추출 시도
        response_text = response.response.lower()
        
        # 감정 추출
        if "따뜻" in response_text or "포근" in response_text:
            result.emotion = "따뜻함"
        elif "럭셔리" in response_text or "고급" in response_text:
            result.emotion = "럭셔리함"
        elif "친근" in response_text or "편안" in response_text:
            result.emotion = "친근함"
        elif "전문" in response_text or "신뢰" in response_text:
            result.emotion = "전문성"
        elif "감성" in response_text or "로맨틱" in response_text:
            result.emotion = "감성적"
        
        # 톤 추출
        if "정중" in response_text or "우아" in response_text:
            result.tone = "정중함"
        elif "편안" in response_text or "자연" in response_text:
            result.tone = "편안함"
        elif "고급" in response_text or "세련" in response_text:
            result.tone = "고급스러움"
        elif "객관" in response_text or "사실" in response_text:
            result.tone = "객관적"
        elif "로맨틱" in response_text or "감성" in response_text:
            result.tone = "로맨틱"
        
        # 타겟 추출
        if "여성" in response_text:
            result.target = "여성 고객"
        elif "남성" in response_text:
            result.target = "남성 고객"
        elif "커플" in response_text or "연인" in response_text:
            result.target = "커플"
        elif "가족" in response_text:
            result.target = "가족"
        elif "비즈니스" in response_text:
            result.target = "비즈니스 고객"
        
        return result

# 싱글톤 인스턴스
recommender = ParameterTemplateRecommender()

def get_recommendation(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """API 엔드포인트용 추천 함수"""
    request = RecommendationRequest(**request_data)
    result = recommender.recommend_parameters_and_template(request)
    
    return {
        "emotion": result.emotion,
        "tone": result.tone,
        "target": result.target,
        "template_style": result.template_style,
        "keywords": result.keywords,
        "confidence_score": result.confidence_score,
        "reasoning": result.reasoning,
        "sources": result.sources
    }

if __name__ == "__main__":
    # 테스트 실행
    test_request = RecommendationRequest(
        user_query="따뜻하고 아늑한 느낌의 문구 스타일 추천해줘",
        store_info={
            "name": "포근한 펜션",
            "type": "펜션",
            "location": "강원도",
            "style": "아늑한 분위기"
        }
    )
    
    result = recommender.recommend_parameters_and_template(test_request)
    print("추천 결과:", result)
