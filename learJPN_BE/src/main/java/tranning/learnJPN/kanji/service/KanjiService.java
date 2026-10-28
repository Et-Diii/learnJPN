package tranning.learnJPN.kanji.service;

import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.kanji.dto.KanjiResponse;
import tranning.learnJPN.vocabulary.dto.LessonInfoResponse;

import java.util.List;

public interface KanjiService {

    List<KanjiResponse> searchKanji(String keyword, Level level, Integer lesson);

    KanjiResponse getKanjiDetail(Long id);

    List<LessonInfoResponse> getLessons();

    void addToFlashcardSet(Long kanjiId, Long setId, String email);
}
