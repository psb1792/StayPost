import requests
import json

def test_canvas_api():
    """Canvas Generator API 테스트 함수"""
    
    # API 서버 URL (포트 8001)
    base_url = "http://localhost:8001"
    
    # 1. 헬스 체크 테스트
    print("🏥 헬스 체크 테스트...")
    try:
        health_response = requests.get(f"{base_url}/health")
        print(f"상태 코드: {health_response.status_code}")
        print(f"응답: {health_response.json()}")
        print()
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.")
        return
    except Exception as e:
        print(f"❌ 헬스 체크 오류: {e}")
        return
    
    # 2. Canvas 코드 생성 테스트
    print("🎨 Canvas 코드 생성 테스트...")
    
    # 테스트 데이터
    test_cases = [
        {
            "name": "제주도 여행 포스터",
            "user_input": "제주도 여행을 홍보하는 밝고 경쾌한 포스터를 만들어줘"
        },
        {
            "name": "부산 여행 포스터", 
            "user_input": "부산 여행을 홍보하는 포스터를 만들어줘"
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📝 테스트 케이스: {test_case['name']}")
        
        # POST 요청 데이터
        payload = {
            "user_input": test_case["user_input"]
        }
        
        try:
            # API 호출
            response = requests.post(
                f"{base_url}/generate",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"상태 코드: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ 성공: {result['message']}")
                print(f"생성된 코드 길이: {len(result['canvas_code'])} 문자")
                
                # 생성된 코드의 일부만 출력 (너무 길면 생략)
                if len(result['canvas_code']) > 200:
                    print(f"코드 미리보기: {result['canvas_code'][:200]}...")
                else:
                    print(f"코드: {result['canvas_code']}")
            else:
                print(f"❌ 실패: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ 요청 오류: {e}")
        except json.JSONDecodeError as e:
            print(f"❌ JSON 파싱 오류: {e}")
        except Exception as e:
            print(f"❌ 예상치 못한 오류: {e}")

def test_error_cases():
    """에러 케이스 테스트"""
    print("\n🚨 에러 케이스 테스트...")
    
    base_url = "http://localhost:8001"
    
    # 1. 잘못된 HTTP 메서드 (GET)
    print("\n1. GET 요청 테스트 (POST만 허용)")
    try:
        response = requests.get(f"{base_url}/generate")
        print(f"상태 코드: {response.status_code}")
        print(f"응답: {response.json()}")
    except Exception as e:
        print(f"오류: {e}")
    
    # 2. JSON이 아닌 요청
    print("\n2. JSON이 아닌 요청 테스트")
    try:
        response = requests.post(
            f"{base_url}/generate",
            data="not json",
            headers={"Content-Type": "text/plain"}
        )
        print(f"상태 코드: {response.status_code}")
        print(f"응답: {response.json()}")
    except Exception as e:
        print(f"오류: {e}")
    
    # 3. user_input 필드 누락
    print("\n3. user_input 필드 누락 테스트")
    try:
        response = requests.post(
            f"{base_url}/generate",
            json={"wrong_field": "test"},
            headers={"Content-Type": "application/json"}
        )
        print(f"상태 코드: {response.status_code}")
        print(f"응답: {response.json()}")
    except Exception as e:
        print(f"오류: {e}")
    
    # 4. 빈 user_input
    print("\n4. 빈 user_input 테스트")
    try:
        response = requests.post(
            f"{base_url}/generate",
            json={"user_input": ""},
            headers={"Content-Type": "application/json"}
        )
        print(f"상태 코드: {response.status_code}")
        print(f"응답: {response.json()}")
    except Exception as e:
        print(f"오류: {e}")

if __name__ == "__main__":
    print("🧪 Canvas Generator API 테스트 시작")
    print("=" * 50)
    
    # 정상 케이스 테스트
    test_canvas_api()
    
    # 에러 케이스 테스트
    test_error_cases()
    
    print("\n" + "=" * 50)
    print("✅ 테스트 완료")
