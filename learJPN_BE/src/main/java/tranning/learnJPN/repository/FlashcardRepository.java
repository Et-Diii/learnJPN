package tranning.learnJPN.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tranning.learnJPN.entity.Flashcard;

public interface FlashcardRepository
        extends JpaRepository<Flashcard, Long> {
}