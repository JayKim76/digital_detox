---
name: idle-economy-logic
description: 방치형 게임의 지수적 성장 모델과 보상 체계를 관리합니다.
---

# 미션
캐릭터 성장에 필요한 비용과 시간당 보상 획득량의 밸런스를 계산합니다.

# 구현 가이드라인
1.  **비용 모델 (Cost Model)**: 레벨업 비용은 지수적으로 증가합니다.
    -   공식: `Cost(n) = BaseCost * (GrowthRate ^ n)`
    -   `BaseCost`: 100 (예시)
    -   `GrowthRate`: 1.15 (예시)
    -   `n`: 현재 레벨

2.  **보상 모델 (Reward Model)**: 집중 시간에 비례하여 보상을 지급합니다.
    -   공식: `Reward(t) = (BaseReward * t) * StreakMultiplier`
    -   `BaseReward`: 분당 10 코인
    -   `t`: 집중 시간 (분)
    -   `StreakMultiplier`: 연속 성공 횟수에 따라 증가 (최대 2.0배)

3.  **성장 곡선 (Progression Curve)**:
    -   초반 레벨업은 빠르게 (5~10분 집중으로 가능).
    -   후반 레벨업은 하루 이상의 누적 집중 필요.
    -   특정 레벨(5, 10, 20) 도달 시 진화/외형 변화 이벤트 트리거 필요.
