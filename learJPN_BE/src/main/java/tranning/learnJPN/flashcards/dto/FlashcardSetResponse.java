package tranning.learnJPN.flashcards.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardSetResponse {

    private Long id;

    private String title;

    private String description;

    private Boolean isPublic;

    private Integer totalCards;

    private Integer cardCount;

    private String authorName;

    private Boolean isOwner;

    private LocalDateTime createdAt;
}
