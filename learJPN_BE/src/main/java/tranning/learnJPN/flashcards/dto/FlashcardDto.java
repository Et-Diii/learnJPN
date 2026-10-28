package tranning.learnJPN.flashcards.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardDto {

    private Long id;

    private String frontText;

    private String backText;

    private String exampleText;

    private String cardType;
}
