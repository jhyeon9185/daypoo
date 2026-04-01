# [계획서] 운영 환경 시뮬레이션 봇 활성화 및 개선

이 계획서는 배포 환경의 활성 사용자 수를 늘리고 봇 활동을 안정화하기 위한 단계별 수정 사항을 담고 있습니다.

## 1. 수정 목표
- 백엔드 서버에 `simulation` 프로필을 활성화하여 내부 봇 가동.
- Lambda 봇의 실행 시간을 확보하고(타임아웃 상향), 동작 상태를 상세히 로깅.

## 2. 상세 작업 내역

### Step 1: 백엔드 환경 설정 변경 (`docker-compose.prod.yml`)
- `SPRING_PROFILES_ACTIVE` 환경 변수에 `simulation` 추가.
- 최종 값: `prod,simulation`

### Step 2: Lambda 인프라 설정 변경 (`terraform/lambda.tf`)
- `aws_lambda_function.simulation_bot` 리소스의 `timeout`을 `300`에서 `600`으로 상향 조정.

### Step 3: Lambda 봇 로깅 강화 (`terraform/bot_lambda/main.py`)
- 각 단계(로그인, 기록 생성, 리뷰 작성 등)마다 성공/실패 여부를 명시적으로 출력하도록 수정.
- CloudWatch Logs에서 각 봇의 세부 활동 추적 가능하도록 함.

## 3. 수정 예정 파일
1. `docker-compose.prod.yml`
2. `terraform/lambda.tf`
3. `terraform/bot_lambda/main.py`

## 4. 검증 계획
- 배포 후 `GET /api/v1/rankings/global` 응답에서 `activeUserCount`가 기존 5명에서 30명 이상으로 증가하는지 확인.
## 5. 인프라 확장: OpenSearch 서비스 구축
- 목적: 화장실 검색 기능 강화 및 대규모 데이터 처리 최적화 (OpenSearch 도입).
- 작업 내용:
    - `d:/poop-map/terraform` 경로에서 `terraform apply` 수행.
    - 데이터 암호화, VPC 배포, `t3.small.search` 단일 인스턴스 구성.
- 예상 소요 시간: 약 15~20분.
- 최종 출력물: `opensearch_endpoint` 확인 및 기록.
