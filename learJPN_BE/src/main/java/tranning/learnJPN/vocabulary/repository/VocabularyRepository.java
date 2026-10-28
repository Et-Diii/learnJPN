package tranning.learnJPN.vocabulary.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.vocabulary.entity.Vocabulary;

import java.util.List;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    List<Vocabulary> findByWordContaining(String keyword);

    @Query("SELECT DISTINCT v.topic FROM Vocabulary v WHERE v.topic IS NOT NULL AND v.topic <> ''")
    List<String> findDistinctTopics();

    @Query("SELECT v.lessonNumber, v.lessonTitle, COUNT(v), v.jlptLevel " +
           "FROM Vocabulary v " +
           "WHERE v.lessonNumber IS NOT NULL " +
           "GROUP BY v.lessonNumber, v.lessonTitle, v.jlptLevel " +
           "ORDER BY v.lessonNumber ASC")
    List<Object[]> findLessonsSummary();

    @Query("SELECT v FROM Vocabulary v WHERE " +
           "(:lesson IS NULL OR v.lessonNumber = :lesson) AND " +
           "(:level IS NULL OR v.jlptLevel = :level) AND " +
           "(:topic IS NULL OR :topic = '' OR v.topic = :topic) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(v.word) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.hiragana) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.romaji) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.meaningVi) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Vocabulary> searchVocabulary(
            @Param("keyword") String keyword,
            @Param("level") Level level,
            @Param("topic") String topic,
            @Param("lesson") Integer lesson
    );
}