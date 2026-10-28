package tranning.learnJPN.flashcards.entity;

import jakarta.persistence.*;
import lombok.*;
import tranning.learnJPN.auth.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "saved_flashcard_sets",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "user_id",
                                "flashcard_set_id"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedFlashcardSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flashcard_set_id")
    private FlashcardSet flashcardSet;

    @Column(name = "saved_at")
    private LocalDateTime savedAt;
}