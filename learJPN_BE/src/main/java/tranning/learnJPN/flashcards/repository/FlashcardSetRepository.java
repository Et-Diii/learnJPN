package tranning.learnJPN.flashcards.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tranning.learnJPN.flashcards.entity.FlashcardSet;
import java.util.List;

@Repository
public interface FlashcardSetRepository
        extends JpaRepository<FlashcardSet, Long> {

    List<FlashcardSet> findByUserId(long userId);
    List<FlashcardSet> findByUserIdOrderByCreatedAtDesc(long userId);
    List<FlashcardSet> findByIsPublic(boolean isPublic);
    List<FlashcardSet> findByIsPublicOrderByCreatedAtDesc(boolean isPublic);
}