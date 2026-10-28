package tranning.learnJPN.flashcards.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tranning.learnJPN.flashcards.entity.FlashcardStudyRecord;

import java.util.List;

@Repository
public interface FlashcardStudyRecordRepository
        extends JpaRepository<FlashcardStudyRecord, Long> {

    List<FlashcardStudyRecord> findBySessionId(Long sessionId);

    List<FlashcardStudyRecord> findBySessionIdAndIsCorrectFalse(Long sessionId);

    long countByUserId(Long userId);
}
