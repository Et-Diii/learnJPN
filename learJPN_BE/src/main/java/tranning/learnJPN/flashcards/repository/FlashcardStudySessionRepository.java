package tranning.learnJPN.flashcards.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tranning.learnJPN.flashcards.entity.FlashcardStudySession;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlashcardStudySessionRepository
        extends JpaRepository<FlashcardStudySession, Long> {

    // Tìm phiên học gần nhất đang dang dở để tiếp tục
    Optional<FlashcardStudySession> findTopByUserIdAndFlashcardSetIdAndIsCompletedFalseOrderByStartedAtDesc(
            Long userId,
            Long setId
    );

    List<FlashcardStudySession> findByUserIdOrderByStartedAtDesc(Long userId);

    long countByUserIdAndIsCompletedTrue(Long userId);
}
