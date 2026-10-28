package tranning.learnJPN.flashcards.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tranning.learnJPN.flashcards.entity.FlashcardSet;
import tranning.learnJPN.flashcards.entity.SavedFlashcardSet;
import tranning.learnJPN.auth.entity.User;

import java.util.List;

@Repository
public interface SavedFlashcardSetRepository
        extends JpaRepository<SavedFlashcardSet, Long> {

    List<SavedFlashcardSet> findByUserUsername(String username);

    List<SavedFlashcardSet> findByUserId(Long userId);

    boolean existsByUserAndFlashcardSet(
            User user,
            FlashcardSet flashcardSet
    );

    @Modifying
    @Transactional
    void deleteByUserAndFlashcardSet(
            User user,
            FlashcardSet flashcardSet
    );

    @Modifying
    @Transactional
    void deleteByFlashcardSetId(Long flashcardSetId);
}