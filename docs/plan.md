# 멤버십(구독) 시스템 도입 및 백엔드 리팩토링 계획

## 목적
사용자의 요청에 따라 `PRO`, `PREMIUM` 멤버십(구독) 시스템을 도입합니다. 단순 포인트 충전을 넘어 정기 구독 형태의 회원 등급 관리를 위해 `Subscription` 테이블을 추가하고, 결제 완료 시 유저의 역할을 자동으로 업그레이드하는 로직을 구현합니다.

## 수정 사항 상세

### 1. 권한(Role) 확장
- **`Role.java`**: `ROLE_PRO`, `ROLE_PREMIUM`을 추가하여 스프링 시큐리티 및 프론트엔드에서 회원 등급에 따른 접근 제어를 가능하게 합니다.

### 2. 구독(Subscription) 테이블 도입
- **`Subscription` 엔티티**: 구독 정보(플랜 종류, 시작일, 만료일, 상태 등)를 추적하기 위해 생성합니다.
- **필드 구성**: `id`, `user`, `planType` (ENUM: PRO, PREMIUM), `startDate`, `endDate`, `status` (ACTIVE, EXPIRED 등).
- **이유**: 단순 `Role` 변경만으로는 구독 만료 처리가 어렵기 때문에 별도의 테이블을 통해 기간 정보를 관리합니다.

### 3. 결제 처리 로직 고도화 (`PaymentService`)
- **`confirmPayment` 수정**: 결제 성공 시 `orderId` 또는 `amount`를 분석하여 멤버십 가입 여부를 판단합니다.
- **로직 상세**:
  - `PRO` 또는 `PREMIUM` 플랜 결제 시:
    - 해당 유저의 `Subscription` 데이터를 생성하거나 기존 데이터의 `endDate`를 30일 연장합니다.
    - 유저의 `Role`을 해당 등급으로 업데이트합니다.
  - 일반 포인트 충전 시: 기존처럼 `addPointsToUser`를 수행합니다.

## 작업 단계

### Step 1: 엔티티 및 DB 스키마 추가
- `V14__add_subscription_table.sql` 마이그레이션 파일 작성.
- `Role.java` 수정: `ROLE_PRO`, `ROLE_PREMIUM` 추가.
- `Subscription.java` 엔티티 클래스 생성.
- `SubscriptionRepository.java` 인터페이스 생성.

### Step 2: 비즈니스 로직 수정
- `User.java`에 `Subscription` 연관 관계 추가 (필요시).
- `PaymentService.java` 수정: 결제 완료 시 구독 정보를 처리하는 로직을 추가합니다.
  - `4900`원 -> `ROLE_PRO` (30일 구독)
  - `9900`원 -> `ROLE_PREMIUM` (30일 구독)
  - 기타 금액 -> 포인트 충전

### Step 3: API 응답 확장
- `UserResponse.java`에 `role` 정보를 명시적으로 포함하여 프론트엔드에서 등급에 따른 UI 처리가 가능하도록 합니다.

## 검증 항목
- [ ] 4,900원 결제 완료 시 유저의 역할이 `ROLE_PRO`로 변경되는지 확인.
- [ ] 9,900원 결제 완료 시 유저의 역할이 `ROLE_PREMIUM`로 변경되는지 확인.
- [ ] `subscriptions` 테이블에 시작일과 만료일(30일 후)이 정확히 저장되는지 확인.
- [ ] 기존 포인트 충전 기능이 정상적으로 동작하는지 확인.

---
[✅ 규칙을 잘 수행했습니다.]
