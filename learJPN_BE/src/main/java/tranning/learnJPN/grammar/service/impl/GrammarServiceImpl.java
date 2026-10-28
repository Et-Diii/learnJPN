package tranning.learnJPN.grammar.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.flashcards.entity.Flashcard;
import tranning.learnJPN.flashcards.entity.FlashcardSet;
import tranning.learnJPN.flashcards.repository.FlashcardRepository;
import tranning.learnJPN.flashcards.repository.FlashcardSetRepository;
import tranning.learnJPN.grammar.dto.GrammarResponse;
import tranning.learnJPN.grammar.entity.Grammar;
import tranning.learnJPN.grammar.repository.GrammarRepository;
import tranning.learnJPN.grammar.service.GrammarService;
import tranning.learnJPN.vocabulary.dto.LessonInfoResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrammarServiceImpl implements GrammarService {

    private final GrammarRepository grammarRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GrammarResponse> searchGrammar(String keyword, Level level, String topic, Integer lesson) {
        List<Grammar> list = grammarRepository.searchGrammar(keyword, level, topic, lesson);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarResponse getGrammarDetail(Long id) {
        Grammar g = grammarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy điểm ngữ pháp với id: " + id));
        return mapToResponse(g);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTopics() {
        return grammarRepository.findDistinctTopics();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonInfoResponse> getLessons() {
        List<Object[]> rows = grammarRepository.findLessonsSummary();
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
    public void addToFlashcardSet(Long grammarId, Long setId, String email) {
        Grammar grammar = grammarRepository.findById(grammarId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy điểm ngữ pháp"));

        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ thẻ Flashcard"));

        String front = grammar.getTitle();
        if (grammar.getStructure() != null && !grammar.getStructure().trim().isEmpty()) {
            front += " [" + grammar.getStructure() + "]";
        }

        String back = grammar.getMeaningVi();

        String example = "";
        if (grammar.getExamples() != null && !grammar.getExamples().trim().isEmpty()) {
            example = grammar.getExamples();
        } else if (grammar.getExplanation() != null && !grammar.getExplanation().trim().isEmpty()) {
            example = grammar.getExplanation();
        }

        Flashcard card = Flashcard.builder()
                .frontText(front)
                .backText(back)
                .exampleText(example)
                .cardType("GRAMMAR")
                .flashcardSet(set)
                .createdAt(LocalDateTime.now())
                .build();

        flashcardRepository.save(card);
    }

    private GrammarResponse mapToResponse(Grammar g) {
        return GrammarResponse.builder()
                .id(g.getId())
                .title(g.getTitle())
                .structure(g.getStructure())
                .meaningVi(g.getMeaningVi())
                .jlptLevel(g.getJlptLevel())
                .topic(g.getTopic())
                .lessonNumber(g.getLessonNumber())
                .lessonTitle(g.getLessonTitle())
                .explanation(g.getExplanation())
                .cautionNotes(g.getCautionNotes())
                .examples(g.getExamples())
                .build();
    }
}
