# Architecture

## Goals

- 요구 기능(랜덤 voxel 지형, 이동/점프, 모바일 조작)을 1차 구현
- 이후 개발자가 기능을 쉽게 확장할 수 있도록 모듈 분리
- 재현 가능한 월드(seed)와 테스트 가능한 도메인 로직 유지

## Module Boundaries

### 1) World Generation Layer

- 파일: `src/features/world/generator.ts`, `src/features/world/types.ts`
- 책임:
  - `TerrainConfig`를 받아 deterministic `GeneratedWorld` 생성
  - seed/noiseIntensity를 정규화
  - 테스트 가능한 순수 계산 로직 제공

### 2) Voxel Meshing Layer

- 파일: `src/features/world/chunkMesher.ts`
- 책임:
  - heightMap을 청크(기본 16x16)로 분할
  - 내부(hidden) 블록 제외, 노출된 블록만 생성
  - 높이에 따른 색상 밴드 분류

### 3) Runtime Layer

- 파일: `src/features/player/PlayerController.tsx`, `src/features/world/TerrainPhysics.tsx`
- 책임:
  - Rapier 기반 이동/중력/점프
  - 카메라(1인칭) 동기화
  - 월드 충돌(Heightfield Collider)

### 4) Input Layer

- 파일: `src/features/input/DesktopInputAdapter.ts`, `src/features/input/MobileInputAdapter.ts`, `src/features/input/LookControlsBridge.tsx`
- 책임:
  - 입력 수집을 `InputAdapter` 인터페이스로 캡슐화
  - 데스크탑/모바일 입력 장치 차이를 도메인에서 분리
  - 시야 회전 입력을 별도 브릿지에서 관리

### 5) UI Layer

- 파일: `src/features/ui/StartConfigModal.tsx`, `src/features/ui/MobileControlPad.tsx`
- 책임:
  - 월드 생성 파라미터 입력 UX
  - 모바일 터치 컨트롤 제공

### 6) Composition + State

- 파일: `src/app/page.tsx`, `src/store/useWorldStore.ts`, `src/store/useLookStore.ts`
- 책임:
  - 씬/입력/상태 연결
  - 월드 생성 트리거와 HUD 표시

## Public Interfaces

- `TerrainConfig`: `{ seed, size, noiseIntensity }`
- `GeneratedWorld`: `{ size, maxHeight, heightMap, config }`
- `WorldGenerator.generate(config)`
- `InputAdapter.getMoveAxis()`, `InputAdapter.consumeJumpPressed()`
- `VoxelChunk.instancesByBand`

## Extension Points

1. Biome 시스템
- `resolveHeightBand`를 biome rule engine으로 교체
- `TerrainConfig`에 `biomePreset` 추가

2. Infinite / Streaming World
- 현재 chunk mesher를 기준으로 카메라 주변 chunk만 동적 생성
- `useWorldStore`를 chunk cache 중심 구조로 확장

3. Interaction (블록 설치/파괴)
- raycast + block edit command layer 추가
- world 데이터 구조를 mutable chunk map으로 변경

4. Multiplayer
- 입력 이벤트와 월드 변경 이벤트를 네트워크 메시지로 분리
- authoritative server 동기화 레이어 추가

## Testing Strategy

- Unit (Vitest)
  - seed 재현성
  - noiseIntensity 변화에 따른 분산 증가
  - 색상 밴드 경계
  - 입력 어댑터 동작

- E2E (Playwright)
  - 시작 모달 진입/월드 생성
  - 데스크탑 이동/점프
  - 모바일 컨트롤 패널 표시/점프

## Performance Notes

- 렌더링은 인스턴싱을 사용해 draw call을 줄임
- 내부 블록 제거로 렌더/메모리 절약
- 초기 목표: desktop 60fps, mobile 30fps

## Deployment

- 플랫폼: Vercel
- `next build` / `next start` 기본 플로우 사용
