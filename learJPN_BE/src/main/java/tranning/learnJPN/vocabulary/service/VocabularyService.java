package tranning.learnJPN.vocabulary.service;

import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.vocabulary.dto.LessonInfoResponse;
import tranning.learnJPN.vocabulary.dto.VocabularyResponse;

import java.util.List;

public interface VocabularyService {

    List<VocabularyResponse> searchVocabulary(String keyword, Level level, String topic, Integer lesson);

    VocabularyResponse getVocabularyDetail(Long id);

    List<String> getAllTopics();

    List<LessonInfoResponse> getLessons();

    void addToFlashcardSet(Long vocabularyId, Long setId, String email);
}
