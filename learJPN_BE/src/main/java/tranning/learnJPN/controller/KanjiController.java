package tranning.learnJPN.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.entity.Kanji;
import tranning.learnJPN.repository.KanjiRepository;

import java.util.List;

@RestController
@RequestMapping("/api/kanji")
@RequiredArgsConstructor
@CrossOrigin("*")
public class KanjiController {

    private final KanjiRepository kanjiRepository;

    @GetMapping
    public List<Kanji> getAllKanji() {
        return kanjiRepository.findAll();
    }

    @PostMapping
    public Kanji createKanji(@RequestBody Kanji kanji) {
        return kanjiRepository.save(kanji);
    }

    @GetMapping("/search")
    public List<Kanji> searchKanji(@RequestParam String keyword) {
        return kanjiRepository.findByKanjiContaining(keyword);
    }
}