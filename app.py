from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from canvas_generator_pipeline import CanvasGeneratorPipeline

# 환경변수 로드
load_dotenv()

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)  # CORS 설정 (필요시)

# Canvas Generator Pipeline 초기화
try:
    pipeline = CanvasGeneratorPipeline()
    print("✅ Canvas Generator Pipeline 초기화 성공")
except Exception as e:
    print(f"❌ Canvas Generator Pipeline 초기화 실패: {e}")
    pipeline = None

@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크 엔드포인트"""
    return jsonify({
        "status": "healthy",
        "pipeline_ready": pipeline is not None,
        "message": "Canvas Generator API is running"
    })

@app.route('/generate', methods=['POST'])
def generate_canvas():
    """
    Canvas JS 코드 생성 API 엔드포인트
    
    요청 형식:
    {
        "user_input": "사용자 입력 문구"
    }
    
    응답 형식:
    {
        "success": true/false,
        "canvas_code": "생성된 Canvas JS 코드",
        "message": "응답 메시지"
    }
    """
    
    # POST 요청만 허용
    if request.method != 'POST':
        return jsonify({
            "success": False,
            "canvas_code": "",
            "message": "POST 메서드만 지원됩니다."
        }), 405
    
    # JSON 요청 본문 확인
    if not request.is_json:
        return jsonify({
            "success": False,
            "canvas_code": "",
            "message": "JSON 형식의 요청 본문이 필요합니다."
        }), 400
    
    # 요청 데이터 추출
    data = request.get_json()
    
    # user_input 필드 확인
    if 'user_input' not in data:
        return jsonify({
            "success": False,
            "canvas_code": "",
            "message": "user_input 필드가 필요합니다."
        }), 400
    
    user_input = data['user_input']
    
    # user_input이 비어있는지 확인
    if not user_input or not user_input.strip():
        return jsonify({
            "success": False,
            "canvas_code": "",
            "message": "user_input은 비어있을 수 없습니다."
        }), 400
    
    # Pipeline이 준비되지 않은 경우
    if pipeline is None:
        return jsonify({
            "success": False,
            "canvas_code": "",
            "message": "Canvas Generator Pipeline이 초기화되지 않았습니다."
        }), 500
    
    try:
        # Canvas 코드 생성
        canvas_code = pipeline.generate_canvas_code(user_input.strip())
        
        # 성공 응답
        return jsonify({
            "success": True,
            "canvas_code": canvas_code,
            "message": "Canvas JS 코드가 성공적으로 생성되었습니다."
        }), 200
        
    except Exception as e:
        # 오류 응답
        error_message = f"Canvas 코드 생성 중 오류가 발생했습니다: {str(e)}"
        print(f"❌ API 오류: {error_message}")
        
        return jsonify({
            "success": False,
            "canvas_code": "",
            "message": error_message
        }), 500

@app.errorhandler(404)
def not_found(error):
    """404 오류 핸들러"""
    return jsonify({
        "success": False,
        "canvas_code": "",
        "message": "요청한 엔드포인트를 찾을 수 없습니다."
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500 오류 핸들러"""
    return jsonify({
        "success": False,
        "canvas_code": "",
        "message": "서버 내부 오류가 발생했습니다."
    }), 500

if __name__ == '__main__':
    # 서버 실행 설정
    port = int(os.environ.get('PORT', 8001))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 Canvas Generator API 서버 시작")
    print(f"📍 포트: {port}")
    print(f"🔧 디버그 모드: {debug}")
    print(f"📡 API 엔드포인트: http://localhost:{port}/generate")
    print(f"🏥 헬스 체크: http://localhost:{port}/health")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
