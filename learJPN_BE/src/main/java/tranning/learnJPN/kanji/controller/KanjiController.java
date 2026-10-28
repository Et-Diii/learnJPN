package tranning.learnJPN.kanji.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.kanji.dto.AddKanjiToSetRequest;
import tranning.learnJPN.kanji.dto.KanjiResponse;
import tranning.learnJPN.kanji.entity.Kanji;
import tranning.learnJPN.kanji.repository.KanjiRepository;
import tranning.learnJPN.kanji.service.KanjiService;
import tranning.learnJPN.vocabulary.dto.LessonInfoResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kanji")
@RequiredArgsConstructor
@CrossOrigin("*")
public class KanjiController {

    private final KanjiService kanjiService;
    private final KanjiRepository kanjiRepository;

    @GetMapping
    public List<KanjiResponse> getKanji(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Level level,
            @RequestParam(required = false) Integer lesson
    ) {
        return kanjiService.searchKanji(keyword, level, lesson);
    }

    @GetMapping("/lessons")
    public List<LessonInfoResponse> getLessons() {
        return kanjiService.getLessons();
    }

    @GetMapping("/{id}")
    public KanjiResponse getDetail(@PathVariable Long id) {
        return kanjiService.getKanjiDetail(id);
    }

    @PostMapping("/{id}/add-to-set")
    public ResponseEntity<?> addToFlashcardSet(
            @PathVariable Long id,
            @RequestBody AddKanjiToSetRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "user";
        kanjiService.addToFlashcardSet(id, request.getSetId(), email);
        return ResponseEntity.ok(Map.of("message", "Đã thêm chữ Kanji vào bộ thẻ Flashcard thành công!"));
    }

    // Endpoint tương thích ngược
    @GetMapping("/legacy")
    public List<Kanji> getAllLegacy() {
        return kanjiRepository.findAll();
    }

    @GetMapping("/search")
    public List<Kanji> searchLegacy(@RequestParam String keyword) {
        return kanjiRepository.findByKanjiContaining(keyword);
    }

    @PostMapping
    public Kanji createLegacy(@RequestBody Kanji kanji) {
        return kanjiRepository.save(kanji);
    }
}