package tranning.learnJPN.flashcards.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionResponse {

    private Long sessionId;

    private Long setId;

    private String setTitle;

    private String mode;

    private Integer lastCardIndex;

    private Integer totalCards;

    private Integer correctCount;

    private Integer wrongCount;

    @Builder.Default
    private List<FlashcardDto> cards = new ArrayList<>();
}
