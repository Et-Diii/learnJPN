package tranning.learnJPN.dto;

import lombok.Data;

@Data
public class CreateFlashcardRequest {

    private String frontText;
    private String backText;
    private String exampleText;
    private String cardType;

}