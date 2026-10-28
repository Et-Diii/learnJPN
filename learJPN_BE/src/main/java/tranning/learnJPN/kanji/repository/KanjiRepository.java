package tranning.learnJPN.kanji.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.kanji.entity.Kanji;

import java.util.List;

public interface KanjiRepository extends JpaRepository<Kanji, Long> {

    List<Kanji> findByKanjiContaining(String keyword);

    @Query("SELECT k.lessonNumber, k.lessonTitle, COUNT(k), k.jlptLevel " +
           "FROM Kanji k " +
           "WHERE k.lessonNumber IS NOT NULL " +
           "GROUP BY k.lessonNumber, k.lessonTitle, k.jlptLevel " +
           "ORDER BY k.lessonNumber ASC")
    List<Object[]> findLessonsSummary();

    @Query("SELECT k FROM Kanji k WHERE " +
           "(:lesson IS NULL OR k.lessonNumber = :lesson) AND " +
           "(:level IS NULL OR k.jlptLevel = :level) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(k.kanji) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(k.hanViet) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(k.onyomi) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(k.kunyomi) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(k.meaningVi) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Kanji> searchKanji(
            @Param("keyword") String keyword,
            @Param("level") Level level,
            @Param("lesson") Integer lesson
    );
}
