from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnablePassthrough
from prompts import PENSION_ANALYSIS_PROMPT
from schemas import PensionAnalysis
import os
import json
import logging
import re

logger = logging.getLogger(__name__)


def extract_json_from_text(text):
    """
    텍스트에서 JSON 블록을 추출하는 헬퍼 함수
    
    Args:
        text (str): JSON이 포함된 텍스트
        
    Returns:
        dict: 파싱된 JSON 데이터 또는 None
    """
    if not text:
        return None
    
    logger.info(f"JSON 추출 시작. 텍스트 길이: {len(text)}")
    logger.info(f"텍스트 내용: {text}")
    
    # 여러 가지 JSON 추출 방법 시도
    patterns = [
        # 1. 백틱으로 감싸진 JSON (가장 정확)
        r'```(?:json)?\s*(\{.*?\})\s*```',
        # 2. 일반적인 JSON 블록 (중첩된 객체 고려)
        r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
        # 3. 단순한 중괄호 쌍 (마지막 수단)
        r'\{.*?\}',
    ]
    
    for i, pattern in enumerate(patterns):
        matches = re.findall(pattern, text, re.DOTALL)
        logger.info(f"패턴 {i+1} ({pattern}) 매치 수: {len(matches)}")
        
        for j, match in enumerate(matches):
            try:
                # 백틱 패턴의 경우 그룹 1을 사용
                json_str = match if isinstance(match, str) else match[0]
                # 불필요한 공백 제거
                json_str = json_str.strip()
                logger.info(f"패턴 {i+1}, 매치 {j+1} 시도: {json_str[:100]}...")
                
                # JSON 파싱 시도
                parsed = json.loads(json_str)
                logger.info(f"JSON 추출 성공 (패턴 {i+1}, 매치 {j+1})")
                return parsed
            except (json.JSONDecodeError, IndexError, AttributeError) as e:
                logger.warning(f"패턴 {i+1}, 매치 {j+1} 파싱 실패: {str(e)}")
                continue
    
    # 마지막 시도: 첫 번째 {와 마지막 } 사이의 모든 내용
    try:
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end > start:
            json_str = text[start:end+1]
            logger.info(f"시작/끝 인덱스 시도: {json_str[:100]}...")
            parsed = json.loads(json_str)
            logger.info("JSON 추출 성공 (시작/끝 인덱스)")
            return parsed
    except json.JSONDecodeError as e:
        logger.warning(f"시작/끝 인덱스 파싱 실패: {str(e)}")
    
    # 추가 시도: JSON 수정 시도
    try:
        # 일반적인 JSON 오류 수정 시도
        modified_text = text.strip()
        
        # 불필요한 텍스트 제거 시도
        if '```' in modified_text:
            # 마크다운 블록 제거
            start = modified_text.find('```')
            end = modified_text.rfind('```')
            if start != -1 and end > start:
                modified_text = modified_text[start+3:end].strip()
                if modified_text.startswith('json'):
                    modified_text = modified_text[4:].strip()
        
        # JSON 블록 찾기
        start = modified_text.find('{')
        end = modified_text.rfind('}')
        if start != -1 and end > start:
            json_str = modified_text[start:end+1]
            
            # 일반적인 JSON 오류 수정
            json_str = json_str.replace('\n', ' ').replace('\r', ' ')
            json_str = re.sub(r'\s+', ' ', json_str)  # 여러 공백을 하나로
            
            logger.info(f"수정 후 시도: {json_str[:100]}...")
            parsed = json.loads(json_str)
            logger.info("JSON 추출 성공 (수정 후)")
            return parsed
    except json.JSONDecodeError as e:
        logger.warning(f"수정 후 파싱 실패: {str(e)}")
    
    # AI가 JSON 형식이 아닌 다른 형태로 응답한 경우를 대비한 처리
    logger.warning("JSON 추출 실패. AI 응답이 JSON 형식이 아닐 수 있습니다.")
    logger.warning(f"전체 응답 내용: {text}")
    
    return None


def extract_info_from_text(text):
    """
    AI 응답이 JSON 형식이 아닐 경우, 텍스트에서 정보를 추출하여 JSON으로 변환
    
    Args:
        text (str): AI 응답 텍스트
        
    Returns:
        dict: 추출된 정보를 담은 딕셔너리
    """
    logger.info("텍스트에서 정보 추출 시도")
    
    # 기본 구조
    extracted_data = {
        "core_style": [],
        "key_elements": [],
        "target_persona": [],
        "recommended_activities": [],
        "unsuitable_persona": [],
        "confidence_score": 0.5,
        "pablo_memo": "이미지 분석 결과를 추출했습니다."
    }
    
    try:
        # 텍스트를 줄 단위로 분리
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # 핵심 스타일 추출
            if any(keyword in line.lower() for keyword in ['스타일', 'style', '디자인', 'design']):
                if ':' in line or '：' in line:
                    content = line.split(':', 1)[1] if ':' in line else line.split('：', 1)[1]
                    items = [item.strip() for item in content.split(',') if item.strip()]
                    if items:
                        extracted_data["core_style"].extend(items[:3])  # 최대 3개
        
        # 기본값 설정
        if not extracted_data["core_style"]:
            extracted_data["core_style"] = ["기본 스타일"]
        if not extracted_data["key_elements"]:
            extracted_data["key_elements"] = ["기본 요소"]
        if not extracted_data["target_persona"]:
            extracted_data["target_persona"] = ["일반 고객"]
        if not extracted_data["recommended_activities"]:
            extracted_data["recommended_activities"] = ["기본 활동"]
        if not extracted_data["unsuitable_persona"]:
            extracted_data["unsuitable_persona"] = ["부적합 고객"]
            
        # 메모 업데이트
        if len(text) > 50:
            extracted_data["pablo_memo"] = text[:200] + "..." if len(text) > 200 else text
        else:
            extracted_data["pablo_memo"] = "이미지 분석을 완료했습니다."
            
        logger.info(f"텍스트에서 추출된 데이터: {extracted_data}")
        return extracted_data
        
    except Exception as e:
        logger.error(f"텍스트 정보 추출 실패: {str(e)}")
        return extracted_data


def create_fallback_response():
    """
    기본 응답을 생성하는 헬퍼 함수
    
    Returns:
        PensionAnalysis: 기본 응답 객체
    """
    return PensionAnalysis(
        core_style=["기본 스타일"],
        key_elements=["기본 요소"],
        target_persona=["일반 고객"],
        recommended_activities=["기본 활동"],
        unsuitable_persona=["부적합 고객"],
        confidence_score=0.1,
        pablo_memo="이미지 분석에 실패했습니다. 다시 시도해주시거나 다른 이미지를 업로드해주세요."
    )


def create_pension_analysis_chain():
    """
    펜션 스타일 분석을 위한 LangChain 체인을 생성합니다.
    
    Returns:
        LangChain Runnable: 펜션 분석 체인
    """
    # OpenAI 모델 초기화
    model = ChatOpenAI(
        model="gpt-4o",
        temperature=0.3,  # 일관된 분석을 위해 낮은 temperature 설정
        max_tokens=2000
    )
    
    # Pydantic 출력 파서 초기화
    parser = PydanticOutputParser(pydantic_object=PensionAnalysis)
    
    # LCEL 체인 구성
    chain = (
        {"image_urls": RunnablePassthrough()} 
        | PENSION_ANALYSIS_PROMPT 
        | model 
        | parser
    )
    
    return chain


def analyze_pension_style_with_retry(image_urls, max_retries=1):
    """
    펜션 스타일 분석을 수행하며, 파싱 실패 시 재시도를 지원합니다.
    
    Args:
        image_urls (List[str]): 분석할 펜션 이미지 URL 목록
        max_retries (int): 최대 재시도 횟수 (기본값: 1)
    
    Returns:
        tuple: (PensionAnalysis, str) - 분석 결과와 원본 텍스트
    """
    chain = create_pension_analysis_chain()
    
    # 이미지 URL들을 문자열로 변환
    image_urls_text = "\n".join([f"- {url}" for url in image_urls])
    
    for attempt in range(max_retries + 1):
        try:
            # 체인 실행
            result = chain.invoke(image_urls_text)
            logger.info("펜션 분석 성공")
            return result, None
        except Exception as e:
            logger.warning(f"파싱 실패 (시도 {attempt + 1}/{max_retries + 1}): {str(e)}")
            
            if attempt < max_retries:
                logger.info(f"재시도 중... (시도 {attempt + 1}/{max_retries + 1})")
                continue
            else:
                # 마지막 시도에서도 실패한 경우, 원본 텍스트를 가져와서 수동 파싱 시도
                try:
                    print("=== 원본 텍스트 생성 시작 ===")
                    logger.info("원본 텍스트 생성 시작")
                    # 원본 텍스트만 가져오기
                    model = ChatOpenAI(model="gpt-4o", temperature=0.3)
                    print("=== ChatOpenAI 모델 생성 완료 ===")
                    logger.info("ChatOpenAI 모델 생성 완료")
                    
                    prompt_response = PENSION_ANALYSIS_PROMPT.invoke({"image_urls": image_urls_text})
                    print("=== 프롬프트 생성 완료 ===")
                    logger.info("프롬프트 생성 완료")
                    
                    print("=== AI 모델 호출 시작 ===")
                    logger.info("AI 모델 호출 시작")
                    original_content = model.invoke(prompt_response).content
                    print("=== AI 모델 호출 완료 ===")
                    logger.info("AI 모델 호출 완료")
                    
                    print(f"=== 원본 응답 길이: {len(original_content)} ===")
                    print(f"=== 원본 응답 내용 (전체): {original_content} ===")
                    logger.info(f"원본 응답 길이: {len(original_content)}")
                    logger.info(f"원본 응답 내용 (전체): {original_content}")
                    
                    # 개선된 JSON 추출 시도
                    parsed_data = extract_json_from_text(original_content)
                    
                    if parsed_data:
                        logger.info(f"추출된 JSON 데이터: {parsed_data}")
                        try:
                            # Pydantic 모델로 변환
                            result = PensionAnalysis(**parsed_data)
                            logger.info("수동 파싱 성공")
                            return result, original_content
                        except Exception as validation_error:
                            logger.error(f"Pydantic 검증 실패: {str(validation_error)}")
                            logger.error(f"검증 실패한 데이터: {parsed_data}")
                            
                            # 검증 실패 시 기본값으로 수정 시도
                            try:
                                logger.info("검증 실패한 데이터를 기본값으로 수정 시도")
                                # 필수 필드가 없는 경우 기본값 추가
                                required_fields = {
                                    'core_style': ['기본 스타일'],
                                    'key_elements': ['기본 요소'],
                                    'target_persona': ['일반 고객'],
                                    'recommended_activities': ['기본 활동'],
                                    'unsuitable_persona': ['부적합 고객'],
                                    'confidence_score': 0.1,
                                    'pablo_memo': '이미지 분석에 실패했습니다.'
                                }
                                
                                # 기존 데이터와 기본값 병합
                                for field, default_value in required_fields.items():
                                    if field not in parsed_data:
                                        parsed_data[field] = default_value
                                    elif field == 'confidence_score':
                                        # confidence_score 범위 검증
                                        try:
                                            score = float(parsed_data[field])
                                            if not 0.0 <= score <= 1.0:
                                                parsed_data[field] = 0.1
                                        except (ValueError, TypeError):
                                            parsed_data[field] = 0.1
                                
                                result = PensionAnalysis(**parsed_data)
                                logger.info("기본값으로 수정 후 파싱 성공")
                                return result, original_content
                                
                            except Exception as fix_error:
                                logger.error(f"기본값 수정도 실패: {str(fix_error)}")
                                # 최종 fallback: 기본 응답 생성
                                logger.warning("최종 fallback: 기본 응답 생성")
                                try:
                                    fallback_result = create_fallback_response()
                                    logger.info("최종 fallback 성공")
                                    return fallback_result, original_content
                                except Exception as final_error:
                                    logger.error(f"최종 fallback도 실패: {str(final_error)}")
                                    return None, original_content
                    else:
                        logger.warning("JSON 추출 실패. 텍스트에서 정보 추출 시도")
                        # JSON 추출이 실패한 경우, 텍스트에서 정보를 추출해보기
                        extracted_data = extract_info_from_text(original_content)
                        
                        if extracted_data:
                            try:
                                result = PensionAnalysis(**extracted_data)
                                logger.info("텍스트 정보 추출 후 파싱 성공")
                                return result, original_content
                            except Exception as text_extract_error:
                                logger.error(f"텍스트 정보 추출 후 파싱 실패: {str(text_extract_error)}")
                                # 최종 fallback: 기본 응답 생성
                                logger.warning("최종 fallback: 기본 응답 생성")
                                try:
                                    fallback_result = create_fallback_response()
                                    logger.info("최종 fallback 성공")
                                    return fallback_result, original_content
                                except Exception as final_error:
                                    logger.error(f"최종 fallback도 실패: {str(final_error)}")
                                    return None, original_content
                        else:
                            logger.error("텍스트 정보 추출도 실패")
                            logger.error(f"추출 실패한 원본 내용: {original_content}")
                            # 최종 fallback: 기본 응답 생성
                            logger.warning("최종 fallback: 기본 응답 생성")
                            try:
                                fallback_result = create_fallback_response()
                                logger.info("최종 fallback 성공")
                                return fallback_result, original_content
                            except Exception as final_error:
                                logger.error(f"최종 fallback도 실패: {str(final_error)}")
                                return None, original_content
                        
                except Exception as inner_e:
                    logger.error(f"원본 텍스트 생성 실패: {str(inner_e)}")
                    logger.error(f"inner_e 타입: {type(inner_e)}")
                    import traceback
                    logger.error(f"inner_e 상세: {traceback.format_exc()}")
                    # 최종 fallback: 기본 응답 생성
                    logger.warning("원본 텍스트 생성 실패 시 최종 fallback: 기본 응답 생성")
                    try:
                        fallback_result = create_fallback_response()
                        logger.info("최종 fallback 성공")
                        return fallback_result, f"Error generating content: {str(inner_e)}"
                    except Exception as final_error:
                        logger.error(f"최종 fallback도 실패: {str(final_error)}")
                        return None, f"Error generating content: {str(inner_e)}"
    
    # 모든 시도가 실패한 경우, 기본 응답 생성
    logger.warning("모든 파싱 시도 실패, 기본 응답 생성")
    try:
        logger.info("기본 응답 생성 시작")
        fallback_result = create_fallback_response()
        logger.info(f"기본 응답 생성 성공: {fallback_result}")
        return fallback_result, "Fallback response generated due to parsing failure"
    except Exception as fallback_error:
        logger.error(f"기본 응답 생성도 실패: {str(fallback_error)}")
        logger.error(f"fallback_error 타입: {type(fallback_error)}")
        import traceback
        logger.error(f"fallback_error 상세: {traceback.format_exc()}")
        return None, "Complete failure - unable to generate any response"


async def call_openai_api(prompt: str, image_urls: list) -> str:
    """
    OpenAI API를 호출하여 이미지 분석을 수행하는 함수
    
    Args:
        prompt (str): 분석 프롬프트
        image_urls (list): 분석할 이미지 URL 리스트
        
    Returns:
        str: AI 응답 텍스트 또는 None
    """
    try:
        from openai import AsyncOpenAI
        
        # OpenAI 클라이언트 초기화
        client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # 이미지 URL들을 OpenAI 형식으로 변환
        image_contents = []
        for url in image_urls:
            image_contents.append({
                "type": "image_url",
                "image_url": {"url": url}
            })
        
        # 메시지 구성
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    *image_contents
                ]
            }
        ]
        
        logger.info(f"OpenAI API 호출 시작: {len(image_urls)}개 이미지")
        
        # OpenAI API 호출
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=4000,
            temperature=0.7
        )
        
        # 응답 추출
        if response.choices and len(response.choices) > 0:
            content = response.choices[0].message.content
            logger.info(f"OpenAI API 응답 성공: {len(content)} 문자")
            return content
        else:
            logger.error("OpenAI API 응답이 비어있습니다")
            return None
            
    except Exception as e:
        logger.error(f"OpenAI API 호출 중 오류: {str(e)}")
        return None
