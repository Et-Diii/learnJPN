package tranning.learnJPN.grammar.service;

import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.grammar.dto.GrammarResponse;
import tranning.learnJPN.vocabulary.dto.LessonInfoResponse;

import java.util.List;

public interface GrammarService {

    List<GrammarResponse> searchGrammar(String keyword, Level level, String topic, Integer lesson);

    GrammarResponse getGrammarDetail(Long id);

    List<String> getAllTopics();

    List<LessonInfoResponse> getLessons();

    void addToFlashcardSet(Long grammarId, Long setId, String email);
}
