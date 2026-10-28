package tranning.learnJPN.grammar.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.grammar.dto.AddGrammarToSetRequest;
import tranning.learnJPN.grammar.dto.GrammarResponse;
import tranning.learnJPN.grammar.service.GrammarService;
import tranning.learnJPN.vocabulary.dto.LessonInfoResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
@CrossOrigin("*")
public class GrammarController {

    private final GrammarService grammarService;

    @GetMapping
    public List<GrammarResponse> getGrammar(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Level level,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) Integer lesson
    ) {
        return grammarService.searchGrammar(keyword, level, topic, lesson);
    }

    @GetMapping("/lessons")
    public List<LessonInfoResponse> getLessons() {
        return grammarService.getLessons();
    }

    @GetMapping("/{id}")
    public GrammarResponse getDetail(@PathVariable Long id) {
        return grammarService.getGrammarDetail(id);
    }

    @GetMapping("/topics")
    public List<String> getTopics() {
        return grammarService.getAllTopics();
    }

    @PostMapping("/{id}/add-to-set")
    public ResponseEntity<?> addToFlashcardSet(
            @PathVariable Long id,
            @RequestBody AddGrammarToSetRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "user";
        grammarService.addToFlashcardSet(id, request.getSetId(), email);
        return ResponseEntity.ok(Map.of("message", "Đã thêm điểm ngữ pháp vào bộ thẻ Flashcard thành công!"));
    }
}
