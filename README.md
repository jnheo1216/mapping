# Voxel Terrain Explorer

Perlin-like noise 기반의 3D voxel 지형을 생성하고, 데스크탑/모바일에서 탐험할 수 있는 Next.js 웹 앱입니다.

## Features

- Seed + noiseIntensity + terrain size 기반 랜덤 월드 생성
- 높이 구간별 5단계 색상 밴드 (water/grass/dirt/rock/snow)
- 3D voxel 블록 렌더링 (노출 블록만 인스턴싱)
- 데스크탑: 방향키 이동, Space 점프, 마우스 시야 조작
- 모바일: 왼쪽 조이스틱 이동, 오른쪽 점프 버튼 + 시야 드래그
- seed 재사용 시 동일 지형 재생성(재현성)

## Tech Stack

- Next.js (App Router) + TypeScript (strict)
- React Three Fiber + Drei + Three.js
- Rapier physics (`@react-three/rapier`)
- Zustand
- simplex-noise
- nipplejs
- Vitest + Playwright

## Requirements

- Node.js 20+
- npm 10+

## Local Development

```bash
npm install
npm run dev
```

기본 주소: `http://127.0.0.1:3000`

## Test

```bash
npm run test:unit
npm run test:e2e
```

## Build

```bash
npm run build
npm run start
```

## Deploy (Vercel)

1. Git 리포지토리를 Vercel에 연결
2. Framework Preset: `Next.js`
3. Build Command: `next build` (기본값)
4. Output: Next.js 기본 설정 사용

별도 런타임 환경변수는 필요하지 않습니다.

## Project Structure

- `src/features/world`: 월드 생성 + 보xel 청크 메셔 + 물리 지형
- `src/features/player`: 플레이어 이동/점프/카메라 컨트롤
- `src/features/input`: 데스크탑/모바일 입력 어댑터 + 포인터락 브릿지
- `src/features/ui`: 시작 설정 모달 + 모바일 터치 컨트롤
- `src/store`: 전역 상태(Zustand)
- `tests/unit`: 도메인/입력 단위 테스트
- `tests/e2e`: 핵심 사용자 흐름 스모크 테스트

자세한 설계 의도는 `docs/architecture.md`를 참고하세요.
