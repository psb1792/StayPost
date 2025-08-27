from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)  # CORS 설정 (필요시)

@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크 엔드포인트"""
    return jsonify({
        "status": "healthy",
        "message": "API is running"
    })

@app.errorhandler(404)
def not_found(error):
    """404 오류 핸들러"""
    return jsonify({
        "success": False,
        "message": "요청한 엔드포인트를 찾을 수 없습니다."
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500 오류 핸들러"""
    return jsonify({
        "success": False,
        "message": "서버 내부 오류가 발생했습니다."
    }), 500

if __name__ == '__main__':
    # 서버 실행 설정
    port = int(os.environ.get('PORT', 8001))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 API 서버 시작")
    print(f"📍 포트: {port}")
    print(f"🔧 디버그 모드: {debug}")
    print(f"🏥 헬스 체크: http://localhost:{port}/health")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
