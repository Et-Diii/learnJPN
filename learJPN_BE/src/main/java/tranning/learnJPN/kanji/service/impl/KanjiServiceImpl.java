package tranning.learnJPN.kanji.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.flashcards.entity.Flashcard;
import tranning.learnJPN.flashcards.entity.FlashcardSet;
import tranning.learnJPN.flashcards.repository.FlashcardRepository;
import tranning.learnJPN.flashcards.repository.FlashcardSetRepository;
import tranning.learnJPN.kanji.dto.KanjiResponse;
import tranning.learnJPN.kanji.entity.Kanji;
import tranning.learnJPN.kanji.repository.KanjiRepository;
import tranning.learnJPN.kanji.service.KanjiService;
import tranning.learnJPN.vocabulary.dto.LessonInfoResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KanjiServiceImpl implements KanjiService {

    private final KanjiRepository kanjiRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;

    @Override
    @Transactional(readOnly = true)
    public List<KanjiResponse> searchKanji(String keyword, Level level, Integer lesson) {
        List<Kanji> list = kanjiRepository.searchKanji(keyword, level, lesson);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public KanjiResponse getKanjiDetail(Long id) {
        Kanji k = kanjiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chữ Kanji với id: " + id));
        return mapToResponse(k);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonInfoResponse> getLessons() {
        List<Object[]> rows = kanjiRepository.findLessonsSummary();
        List<LessonInfoResponse> lessons = new ArrayList<>();
        for (Object[] row : rows) {
            Integer lessonNum = (Integer) row[0];
            String title = (String) row[1];
            Long count = (Long) row[2];
            Level level = (Level) row[3];
            lessons.add(LessonInfoResponse.builder()
                    .lessonNumber(lessonNum)
                    .lessonTitle(title != null ? title : "Bài " + lessonNum)
                    .totalItems(count)
                    .level(level)
                    .build());
        }
        return lessons;
    }

    @Override
    @Transactional
    public void addToFlashcardSet(Long kanjiId, Long setId, String email) {
        Kanji kanji = kanjiRepository.findById(kanjiId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chữ Kanji"));

        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ thẻ Flashcard"));

        String front = kanji.getKanji();
        if (kanji.getHanViet() != null && !kanji.getHanViet().trim().isEmpty()) {
            front += " [" + kanji.getHanViet() + "]";
        }

        String back = kanji.getMeaningVi();
        if (kanji.getOnyomi() != null || kanji.getKunyomi() != null) {
            back += "\n• On: " + (kanji.getOnyomi() != null ? kanji.getOnyomi() : "-");
            back += " | Kun: " + (kanji.getKunyomi() != null ? kanji.getKunyomi() : "-");
        }

        String example = "";
        if (kanji.getExampleSentence() != null && !kanji.getExampleSentence().trim().isEmpty()) {
            example = kanji.getExampleSentence();
            if (kanji.getExampleTranslation() != null && !kanji.getExampleTranslation().trim().isEmpty()) {
                example += " (" + kanji.getExampleTranslation() + ")";
            }
        }

        Flashcard card = Flashcard.builder()
                .frontText(front)
                .backText(back)
                .exampleText(example)
                .cardType("KANJI")
                .flashcardSet(set)
                .createdAt(LocalDateTime.now())
                .build();

        flashcardRepository.save(card);
    }

    private KanjiResponse mapToResponse(Kanji k) {
        return KanjiResponse.builder()
                .id(k.getId())
                .kanji(k.getKanji())
                .onyomi(k.getOnyomi())
                .kunyomi(k.getKunyomi())
                .hanViet(k.getHanViet())
                .meaningVi(k.getMeaningVi())
                .exampleSentence(k.getExampleSentence())
                .exampleTranslation(k.getExampleTranslation())
                .jlptLevel(k.getJlptLevel())
                .radical(k.getRadical())
                .strokeCount(k.getStrokeCount())
                .lessonNumber(k.getLessonNumber())
                .lessonTitle(k.getLessonTitle())
                .build();
    }
}
