"""
매우 간단한 테스트 서버
"""

from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/image-suitability")
def test_image_suitability():
    return {
        "suitability": 85,
        "recommendations": ["테스트 응답입니다"],
        "warnings": [],
        "canProceed": True,
        "imageDescription": "테스트 완료"
    }

if __name__ == "__main__":
    print("Starting test server on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
