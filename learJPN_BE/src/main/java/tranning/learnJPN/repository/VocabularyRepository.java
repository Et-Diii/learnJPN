package tranning.learnJPN.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tranning.learnJPN.entity.Vocabulary;

import java.util.List;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    List<Vocabulary> findByWordContaining(String keyword);
}