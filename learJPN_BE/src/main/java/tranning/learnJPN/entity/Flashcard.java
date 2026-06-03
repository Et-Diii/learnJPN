package tranning.learnJPN.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "flashcards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "front_text", columnDefinition = "TEXT")
    private String frontText;

    @Column(name = "back_text", columnDefinition = "TEXT")
    private String backText;

    @Column(name = "example_text", columnDefinition = "TEXT")
    private String exampleText;

    @Column(name = "card_type")
    private String cardType;

    @ManyToOne
    @JoinColumn(name = "set_id")
    private FlashcardSet flashcardSet;

    private LocalDateTime createdAt;
}