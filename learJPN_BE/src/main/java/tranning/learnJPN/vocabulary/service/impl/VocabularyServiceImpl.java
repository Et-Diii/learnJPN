package tranning.learnJPN.vocabulary.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.flashcards.entity.Flashcard;
import tranning.learnJPN.flashcards.entity.FlashcardSet;
import tranning.learnJPN.flashcards.repository.FlashcardRepository;
import tranning.learnJPN.flashcards.repository.FlashcardSetRepository;
import tranning.learnJPN.vocabulary.dto.LessonInfoResponse;
import tranning.learnJPN.vocabulary.dto.VocabularyResponse;
import tranning.learnJPN.vocabulary.entity.Vocabulary;
import tranning.learnJPN.vocabulary.repository.VocabularyRepository;
import tranning.learnJPN.vocabulary.service.VocabularyService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VocabularyServiceImpl implements VocabularyService {

    private final VocabularyRepository vocabularyRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VocabularyResponse> searchVocabulary(String keyword, Level level, String topic, Integer lesson) {
        List<Vocabulary> list = vocabularyRepository.searchVocabulary(keyword, level, topic, lesson);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VocabularyResponse getVocabularyDetail(Long id) {
        Vocabulary v = vocabularyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy từ vựng với id: " + id));
        return mapToResponse(v);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTopics() {
        return vocabularyRepository.findDistinctTopics();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonInfoResponse> getLessons() {
        List<Object[]> rows = vocabularyRepository.findLessonsSummary();
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
    public void addToFlashcardSet(Long vocabularyId, Long setId, String email) {
        Vocabulary vocab = vocabularyRepository.findById(vocabularyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy từ vựng"));

        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ thẻ Flashcard"));

        String front = vocab.getWord();
        if (vocab.getHiragana() != null && !vocab.getHiragana().trim().isEmpty() && !vocab.getHiragana().equals(vocab.getWord())) {
            front += " (" + vocab.getHiragana() + ")";
        }

        String back = vocab.getMeaningVi();
        if (vocab.getPartOfSpeech() != null && !vocab.getPartOfSpeech().trim().isEmpty()) {
            back = "[" + vocab.getPartOfSpeech() + "] " + back;
        }

        String example = "";
        if (vocab.getExampleSentence() != null && !vocab.getExampleSentence().trim().isEmpty()) {
            example = vocab.getExampleSentence();
            if (vocab.getExampleTranslation() != null && !vocab.getExampleTranslation().trim().isEmpty()) {
                example += "\n→ " + vocab.getExampleTranslation();
            }
        }

        Flashcard card = Flashcard.builder()
                .frontText(front)
                .backText(back)
                .exampleText(example)
                .cardType("VOCAB")
                .flashcardSet(set)
                .createdAt(LocalDateTime.now())
                .build();

        flashcardRepository.save(card);
    }

    private VocabularyResponse mapToResponse(Vocabulary v) {
        return VocabularyResponse.builder()
                .id(v.getId())
                .word(v.getWord())
                .hiragana(v.getHiragana())
                .romaji(v.getRomaji())
                .meaningVi(v.getMeaningVi())
                .exampleSentence(v.getExampleSentence())
                .exampleTranslation(v.getExampleTranslation())
                .partOfSpeech(v.getPartOfSpeech())
                .topic(v.getTopic())
                .kanji(v.getKanji())
                .lessonNumber(v.getLessonNumber())
                .lessonTitle(v.getLessonTitle())
                .jlptLevel(v.getJlptLevel())
                .build();
    }
}
