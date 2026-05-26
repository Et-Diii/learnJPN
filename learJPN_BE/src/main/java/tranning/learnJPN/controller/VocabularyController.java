package tranning.learnJPN.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.entity.Vocabulary;
import tranning.learnJPN.repository.VocabularyRepository;

import java.util.List;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
@CrossOrigin("*")
public class VocabularyController {

    private final VocabularyRepository vocabularyRepository;

    @GetMapping
    public List<Vocabulary> getAllVocabulary() {
        return vocabularyRepository.findAll();
    }

    @PostMapping
    public Vocabulary createVocabulary(@RequestBody Vocabulary vocabulary) {
        return vocabularyRepository.save(vocabulary);
    }

    @GetMapping("/search")
    public List<Vocabulary> searchVocabulary(@RequestParam String keyword) {
        return vocabularyRepository.findByWordContaining(keyword);
    }
}