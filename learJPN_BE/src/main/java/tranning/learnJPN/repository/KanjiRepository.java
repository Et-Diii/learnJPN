package tranning.learnJPN.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tranning.learnJPN.entity.Kanji;

import java.util.List;

public interface KanjiRepository extends JpaRepository<Kanji, Long> {

    List<Kanji> findByKanjiContaining(String keyword);
}
