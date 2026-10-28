package tranning.learnJPN.flashcards.entity;

import jakarta.persistence.*;
import lombok.*;
import tranning.learnJPN.auth.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "flashcard_study_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardStudyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private FlashcardStudySession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Flashcard card;

    @Column(name = "rating")
    private String rating; // AGAIN, HARD, GOOD, EASY

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "user_answer", columnDefinition = "TEXT")
    private String userAnswer;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
