package com.daypoo.api.controller;

import com.daypoo.api.dto.SubscriptionResponse;
import com.daypoo.api.entity.Subscription;
import com.daypoo.api.entity.User;
import com.daypoo.api.service.SubscriptionService;
import com.daypoo.api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subscription", description = "구독 관리 API")
@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

  private final SubscriptionService subscriptionService;
  private final UserService userService;

  /** 내 활성 구독 조회 */
  @Operation(summary = "내 활성 구독 조회", description = "현재 활성화된 구독 정보를 조회합니다.")
  @GetMapping("/me")
  public ResponseEntity<SubscriptionResponse> getMySubscription(
      @AuthenticationPrincipal String email) {
    User user = userService.getByEmail(email);
    Subscription subscription =
        subscriptionService
            .getActiveSubscription(user)
            .orElseThrow(() -> new IllegalArgumentException("활성 구독이 없습니다."));

    return ResponseEntity.ok(SubscriptionResponse.from(subscription));
  }

  /** 구독 히스토리 조회 */
  @Operation(summary = "구독 히스토리", description = "과거 구독 내역을 포함한 전체 히스토리를 조회합니다.")
  @GetMapping("/history")
  public ResponseEntity<List<SubscriptionResponse>> getSubscriptionHistory(
      @AuthenticationPrincipal String email) {
    User user = userService.getByEmail(email);
    List<Subscription> history = subscriptionService.getSubscriptionHistory(user);

    return ResponseEntity.ok(
        history.stream().map(SubscriptionResponse::from).toList());
  }
}
