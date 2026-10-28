package tranning.learnJPN.flashcards.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.auth.entity.User;
import tranning.learnJPN.auth.repository.UserRepository;
import tranning.learnJPN.flashcards.dto.*;
import tranning.learnJPN.flashcards.service.FlashcardSetService;

import java.util.List;

@RestController
@RequestMapping("/api/flashcard-sets")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FlashcardSetController {

    private final FlashcardSetService flashcardSetService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<String> createSet(
            @RequestBody CreateFlashcardSetRequest request,
            Authentication authentication
    ) {
        flashcardSetService.createSet(request, authentication.getName());
        return ResponseEntity.ok("Tạo bộ thẻ thành công");
    }

    @GetMapping("/my")
    public ResponseEntity<List<FlashcardSetResponse>> getMySets(
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(email))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(flashcardSetService.getMySets(user.getId()));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<FlashcardSetResponse>> getSavedSets(
            Authentication authentication
    ) {
        return ResponseEntity.ok(flashcardSetService.getSavedSets(authentication.getName()));
    }

    @GetMapping("/public")
    public ResponseEntity<List<FlashcardSetResponse>> getPublicSets() {
        return ResponseEntity.ok(flashcardSetService.getPublicSets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashcardSetDetailResponse> getSetDetail(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(flashcardSetService.getSetDetail(id, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSet(
            @PathVariable Long id,
            Authentication authentication
    ) {
        flashcardSetService.deleteSet(id, authentication.getName());
        return ResponseEntity.ok("Đã xóa bộ thẻ");
    }

    @PutMapping("/{id}/visibility")
    public ResponseEntity<String> updateVisibility(
            @PathVariable Long id,
            @RequestBody UpdateVisibilityRequest request,
            Authentication authentication
    ) {
        flashcardSetService.updateVisibility(id, request.getIsPublic(), authentication.getName());
        return ResponseEntity.ok("Đã cập nhật trạng thái hiển thị");
    }

    @PostMapping("/{setId}/save")
    public ResponseEntity<String> saveSet(
            @PathVariable Long setId,
            Authentication authentication
    ) {
        flashcardSetService.saveSet(setId, authentication.getName());
        return ResponseEntity.ok("Đã lưu bộ thẻ");
    }

    @DeleteMapping("/{setId}/unsave")
    public ResponseEntity<String> unsaveSet(
            @PathVariable Long setId,
            Authentication authentication
    ) {
        flashcardSetService.unsaveSet(setId, authentication.getName());
        return ResponseEntity.ok("Đã hủy lưu bộ thẻ");
    }

    @PostMapping("/{id}/study/start")
    public ResponseEntity<StudySessionResponse> startStudySession(
            @PathVariable Long id,
            @RequestBody(required = false) StudySessionRequest request,
            Authentication authentication
    ) {
        if (request == null) {
            request = new StudySessionRequest();
        }
        return ResponseEntity.ok(flashcardSetService.startOrResumeSession(id, request, authentication.getName()));
    }

    @PostMapping("/study/review")
    public ResponseEntity<String> recordCardReview(
            @RequestBody CardReviewRequest request,
            Authentication authentication
    ) {
        flashcardSetService.recordCardReview(request, authentication.getName());
        return ResponseEntity.ok("Đã ghi nhận đánh giá");
    }

    @PostMapping("/study/sessions/{sessionId}/complete")
    public ResponseEntity<SessionSummaryResponse> completeStudySession(
            @PathVariable Long sessionId,
            @RequestBody(required = false) CompleteSessionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(flashcardSetService.completeSession(sessionId, request, authentication.getName()));
    }

    @GetMapping("/study/sessions/{sessionId}/summary")
    public ResponseEntity<SessionSummaryResponse> getSessionSummary(
            @PathVariable Long sessionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(flashcardSetService.getSessionSummary(sessionId, authentication.getName()));
    }
}