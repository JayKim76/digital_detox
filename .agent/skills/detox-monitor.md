---
name: detox-monitor
description: 모바일 기기의 앱 사용 시간을 추적하고 집중 모드 위반 여부를 판별합니다.
---

# 미션
사용자가 설정한 집중 시간 동안 지정된 차단 앱 리스트가 포그라운드에 노출되는지 감시합니다.

# 구현 가이드라인
1.  **Android**: `UsageStatsManager`를 사용하여 현재 포그라운드 앱을 주기적으로 확인합니다.
    -   권한: `android.permission.PACKAGE_USAGE_STATS` 필요. 사용자에게 설정 화면으로 이동하여 권한 허용을 요청해야 함.
    -   로직: 지정된 간격(예: 5초)으로 `queryUsageStats`를 호출하여 최근 사용된 앱 패키지명을 확인.
2.  **iOS**: `DeviceActivity` (Screen Time API)를 사용합니다.
    -   권한: Family Controls 권한 필요. 개발자 계정 및 권한 설정 필수.
    -   로직: `DeviceActivityMonitor` 익스텐션을 통해 시스템이 모니터링을 수행하고, 위반 시 콜백을 받음. (직접 앱 목록 확인 불가)
    -   대안(MVP): 앱이 백그라운드로 가면 실패 처리하는 간단한 로직으로 시작 가능.

# 이벤트
-   `SessionInterrupted`: 허용되지 않은 앱 실행 감지 시 발생. 펫의 Vitality 감소.
-   `FocusSuccess`: 설정된 시간 동안 위반 없이 완료 시 발생. 보상 산출.
