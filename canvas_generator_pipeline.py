import json
import os
import re
from typing import Dict, Any
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# 훨씬 더 똑똑한 명령으로 교체된 template_prompt
template_prompt = """당신은 주어진 JSON 설계도를 해석하여 JavaScript Canvas 코드를 생성하는 전문 개발자입니다.

주어진 'layout_structure_json'을 분석하고, 'elements' 배열의 각 요소를 순서대로 Canvas 코드로 번역해주세요.

## 📝 번역 규칙:
- **type: "background"**: `ctx.fillStyle`과 `ctx.fillRect`를 사용해 배경을 칠하세요.
- **type: "text"**: JSON에 명시된 `content`, `font`, `color`, `position`, `align`을 정확히 반영하여 `ctx.font`, `ctx.fillStyle`, `ctx.textAlign`, `ctx.fillText` 코드를 생성하세요. 폰트 굵기(weight)는 폰트 크기 앞에 와야 합니다 (예: 'bold 100px Arial').
- **type: "illustration"**: 간단한 흰색 원으로 대체하여 그리세요. (예: `ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI); ctx.fill();`)
- **type: "image_group"**: JSON의 `layout`, `count`, `shape`, `size`, `position`을 분석하여 도형을 그리는 for 루프를 생성하세요. 예를 들어 `count: 3`, `shape: "circle"` 이면 3개의 원을 그리세요. `layout: "horizontal"`이면 가로로 배치하고, `gap` 값으로 간격을 조정하세요.

## ⚠️ 중요 규칙:
- 어떤 설명이나 주석, 마크다운 코드 블록도 포함하지 마세요.
- 오직 순수한 JavaScript 코드만 출력해야 합니다.
- **canvas와 ctx 변수는 이미 선언되어 있다고 가정하고, 변수 선언 코드는 생성하지 마세요.**
- **그림 그리기 코드만 생성해주세요. (예: canvas.width, canvas.height 설정부터 시작)**
- 텍스트 요소의 content는 JSON 데이터의 {{SUBTITLE}}, {{MAIN_TITLE}}, {{BOTTOM_LABEL}} 값으로 치환하세요.

## 📋 입력 데이터:
- layout_structure_json: {layout_structure_json}

위 설계도를 바탕으로 완성된 JavaScript 코드만 출력하세요."""

class CanvasGeneratorPipeline:
    def __init__(self, openai_api_key: str = None):
        """
        Canvas 코드 생성 파이프라인 초기화
        
        Args:
            openai_api_key: OpenAI API 키 (None이면 환경변수에서 가져옴)
        """
        # API 키 설정
        if openai_api_key is None:
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if not openai_api_key:
                raise ValueError("OpenAI API 키가 필요합니다. 환경변수 OPENAI_API_KEY를 설정하거나 파라미터로 전달해주세요.")
        
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.3,
            api_key=openai_api_key
        )
        
        # Planner Chain (1번째 체인) - 완전한 layout_structure_json 생성
        self.planner_prompt = PromptTemplate(
            input_variables=["user_input"],
            template="""당신은 사용자의 자연어 입력을 분석하여 Canvas 디자인을 위한 완전한 layout_structure_json을 생성하는 전문가입니다.

사용자 입력을 바탕으로, 아래 예시와 동일한 구조를 가진 완전한 JSON 설계도를 생성해주세요. content 부분만 사용자 의도에 맞게 창의적으로 채워넣어주세요.

## 📋 예시 구조 (이와 동일한 구조로 생성):
{{
    "width": 1080,
    "height": 1080,
    "elements": [
        {{ "type": "background", "color": "#87CEEB" }},
        {{
            "id": "subtitle_top",
            "type": "text",
            "content": "{{SUBTITLE}}",
            "font": {{ "family": "Sans Serif", "size": 28, "weight": 600 }},
            "color": "#003366",
            "position": {{ "x": 540, "y": 120 }},
            "align": "center"
        }},
        {{
            "id": "main_title",
            "type": "text",
            "content": "{{MAIN_TITLE}}",
            "font": {{ "family": "Sans Serif", "size": 92, "weight": 800 }},
            "color": "#002244",
            "position": {{ "x": 540, "y": 340 }},
            "align": "center"
        }},
        {{
            "id": "decor_gull_left",
            "type": "illustration",
            "query": "simple flat seagull",
            "position": {{ "x": 240, "y": 80 }},
            "scale": 0.8
        }},
        {{
            "id": "decor_gull_right",
            "type": "illustration",
            "query": "simple flat seagull",
            "position": {{ "x": 840, "y": 80 }},
            "scale": 0.8
        }},
        {{
            "id": "bottom_images",
            "type": "image_group",
            "layout": "horizontal",
            "count": 3,
            "shape": "circle",
            "size": {{ "w": 220, "h": 220 }},
            "gap": 40,
            "position": {{ "x": 540, "y": 780 }},
            "align": "center"
        }},
        {{
            "id": "bottom_label",
            "type": "text",
            "content": "{{BOTTOM_LABEL}}",
            "font": {{ "family": "Sans Serif", "size": 36, "weight": 600 }},
            "color": "#003366",
            "position": {{ "x": 540, "y": 1040 }},
            "align": "center"
        }}
    ],
    "export": {{ "format": "png", "dpi": 72 }}
}}

## 🎯 생성 규칙:
1. 위 예시와 정확히 동일한 구조를 유지하세요
2. width, height, elements 배열, export 설정은 그대로 유지하세요
3. 각 요소의 type, position, font, color 등 속성은 그대로 유지하세요
4. 오직 content 부분의 {{SUBTITLE}}, {{MAIN_TITLE}}, {{BOTTOM_LABEL}}만 사용자 입력에 맞게 창의적으로 변경하세요
5. 사용자의 의도에 맞는 여행/여가 관련 제목과 문구를 생성하세요

사용자 입력: {user_input}

위 예시와 동일한 구조의 완전한 JSON 설계도를 생성해주세요."""
        )
        
        self.planner_chain = (
            self.planner_prompt 
            | self.llm 
            | JsonOutputParser()
        )
        
        # Canvas Generator Chain (2번째 체인)
        self.canvas_prompt = PromptTemplate(
            input_variables=["layout_structure_json"],
            template=template_prompt
        )
        
        self.canvas_chain = (
            self.canvas_prompt 
            | self.llm 
            | StrOutputParser()
        )
        
        # 전체 파이프라인 연결 - planner_chain의 결과를 layout_structure_json으로 변환
        self.pipeline = (
            self.planner_chain
            | {"layout_structure_json": lambda x: json.dumps(x, ensure_ascii=False, indent=2)}
            | self.canvas_chain
        )
    
    def generate_canvas_code(self, user_input: str) -> str:
        """
        사용자 입력을 받아 Canvas JS 코드를 생성하는 메인 함수
        
        Args:
            user_input: 사용자의 자연어 입력
            
        Returns:
            str: 생성된 Canvas JS 코드
        """
        try:
            # 파이프라인 실행
            result = self.pipeline.invoke({"user_input": user_input})
            
            # 코드 블록 제거 로직 추가
            cleaned_code = self._clean_generated_code(result)
            return cleaned_code
            
        except Exception as e:
            print(f"Canvas 코드 생성 중 오류 발생: {e}")
            return f"// 오류 발생: {e}"
    
    def _clean_generated_code(self, raw_code: str) -> str:
        """
        AI가 생성한 코드에서 마크다운 코드 블록과 설명 텍스트를 제거합니다.
        
        Args:
            raw_code: AI가 생성한 원본 코드
            
        Returns:
            str: 정리된 순수 JavaScript 코드
        """
        if not raw_code:
            return raw_code
        
        # ```javascript ... ``` 패턴 제거
        
        # ```javascript로 시작하고 ```로 끝나는 패턴 찾기
        js_block_pattern = r'```javascript\s*\n(.*?)\n```'
        js_match = re.search(js_block_pattern, raw_code, re.DOTALL)
        
        if js_match:
            return js_match.group(1).strip()
        
        # ```로 시작하고 ```로 끝나는 패턴 찾기 (javascript 없이)
        block_pattern = r'```\s*\n(.*?)\n```'
        block_match = re.search(block_pattern, raw_code, re.DOTALL)
        
        if block_match:
            return block_match.group(1).strip()
        
        # "정리된 Canvas 코드:" 같은 설명 텍스트 제거
        # 첫 번째 const나 let으로 시작하는 라인부터 시작
        lines = raw_code.split('\n')
        start_index = 0
        
        for i, line in enumerate(lines):
            if line.strip().startswith(('const ', 'let ', 'var ', 'function ')):
                start_index = i
                break
        
        return '\n'.join(lines[start_index:]).strip()

# 사용 예시
if __name__ == "__main__":
    # 파이프라인 초기화 (환경변수에서 API 키 자동 로드)
    pipeline = CanvasGeneratorPipeline()
    
    # 테스트
    user_input = "제주도 여행을 홍보하는 밝고 경쾌한 포스터를 만들어줘"
    canvas_code = pipeline.generate_canvas_code(user_input)
    print("생성된 Canvas 코드:")
    print(canvas_code)
