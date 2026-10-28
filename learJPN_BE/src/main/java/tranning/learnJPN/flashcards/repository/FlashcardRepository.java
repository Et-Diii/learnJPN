package tranning.learnJPN.flashcards.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tranning.learnJPN.flashcards.entity.Flashcard;

import java.util.List;

@Repository
public interface FlashcardRepository
        extends JpaRepository<Flashcard, Long> {

    List<Flashcard> findByFlashcardSetId(Long flashcardSetId);
}