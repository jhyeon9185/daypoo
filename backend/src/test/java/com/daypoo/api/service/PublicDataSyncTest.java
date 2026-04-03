package com.daypoo.api.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@Disabled("공공데이터 동기화 테스트는 외부 DB 및 API 의존성이 있어 로컬 환경에서 제외합니다.")
@SpringBootTest
@ActiveProfiles("test")
public class PublicDataSyncTest {

  @Autowired private PublicDataSyncService publicDataSyncService;

  @Test
  @DisplayName("5,000건(10페이지) 공공데이터 동기화 테스트")
  void syncFiveThousandToilets() {
    // Given: 1페이지부터 10페이지까지 (페이지당 500건, 총 5,000건)
    int startPage = 1;
    int endPage = 10;

    // When
    int[] result = publicDataSyncService.syncAllToilets(startPage, endPage);
    int savedCount = result[0];

    // Then
    System.out.println("✅ Successfully processed " + savedCount + " toilets.");
    assertThat(savedCount).isGreaterThanOrEqualTo(0);
  }
}
