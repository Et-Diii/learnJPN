package tranning.learnJPN.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tranning.learnJPN.entity.FlashcardSet;

public interface FlashcardSetRepository
        extends JpaRepository<FlashcardSet, Long> {
}