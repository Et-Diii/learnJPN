package tranning.learnJPN.flashcards.entity;

import jakarta.persistence.*;
import lombok.*;
import tranning.learnJPN.auth.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "flashcard_study_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardStudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", nullable = false)
    private FlashcardSet flashcardSet;

    @Column(name = "study_mode")
    private String studyMode; // FLIP, TYPE, QUICK

    @Column(name = "last_card_index")
    private Integer lastCardIndex;

    @Column(name = "total_cards")
    private Integer totalCards;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "wrong_count")
    private Integer wrongCount;

    @Column(name = "is_completed")
    private Boolean isCompleted;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
