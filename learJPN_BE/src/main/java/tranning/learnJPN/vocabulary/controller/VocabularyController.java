package tranning.learnJPN.vocabulary.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.vocabulary.dto.AddToFlashcardSetRequest;
import tranning.learnJPN.vocabulary.dto.LessonInfoResponse;
import tranning.learnJPN.vocabulary.dto.VocabularyResponse;
import tranning.learnJPN.vocabulary.entity.Vocabulary;
import tranning.learnJPN.vocabulary.repository.VocabularyRepository;
import tranning.learnJPN.vocabulary.service.VocabularyService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
@CrossOrigin("*")
public class VocabularyController {

    private final VocabularyService vocabularyService;
    private final VocabularyRepository vocabularyRepository;

    @GetMapping
    public List<VocabularyResponse> getVocabulary(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Level level,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) Integer lesson
    ) {
        return vocabularyService.searchVocabulary(keyword, level, topic, lesson);
    }

    @GetMapping("/lessons")
    public List<LessonInfoResponse> getLessons() {
        return vocabularyService.getLessons();
    }

    @GetMapping("/{id}")
    public VocabularyResponse getDetail(@PathVariable Long id) {
        return vocabularyService.getVocabularyDetail(id);
    }

    @GetMapping("/topics")
    public List<String> getTopics() {
        return vocabularyService.getAllTopics();
    }

    @PostMapping("/{id}/add-to-set")
    public ResponseEntity<?> addToFlashcardSet(
            @PathVariable Long id,
            @RequestBody AddToFlashcardSetRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "user";
        vocabularyService.addToFlashcardSet(id, request.getSetId(), email);
        return ResponseEntity.ok(Map.of("message", "Đã thêm từ vựng vào bộ thẻ Flashcard thành công!"));
    }

    // Endpoint tương thích ngược
    @GetMapping("/search")
    public List<Vocabulary> searchLegacy(@RequestParam String keyword) {
        return vocabularyRepository.findByWordContaining(keyword);
    }

    @PostMapping
    public Vocabulary createLegacy(@RequestBody Vocabulary vocabulary) {
        return vocabularyRepository.save(vocabulary);
    }
}