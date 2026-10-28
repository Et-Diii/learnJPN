package tranning.learnJPN.grammar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.grammar.entity.Grammar;

import java.util.List;

public interface GrammarRepository extends JpaRepository<Grammar, Long> {

    @Query("SELECT DISTINCT g.topic FROM Grammar g WHERE g.topic IS NOT NULL AND g.topic <> ''")
    List<String> findDistinctTopics();

    @Query("SELECT g.lessonNumber, g.lessonTitle, COUNT(g), g.jlptLevel " +
           "FROM Grammar g " +
           "WHERE g.lessonNumber IS NOT NULL " +
           "GROUP BY g.lessonNumber, g.lessonTitle, g.jlptLevel " +
           "ORDER BY g.lessonNumber ASC")
    List<Object[]> findLessonsSummary();

    @Query("SELECT g FROM Grammar g WHERE " +
           "(:lesson IS NULL OR g.lessonNumber = :lesson) AND " +
           "(:level IS NULL OR g.jlptLevel = :level) AND " +
           "(:topic IS NULL OR :topic = '' OR g.topic = :topic) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(g.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(g.structure) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(g.meaningVi) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Grammar> searchGrammar(
            @Param("keyword") String keyword,
            @Param("level") Level level,
            @Param("topic") String topic,
            @Param("lesson") Integer lesson
    );
}
