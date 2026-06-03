package tranning.learnJPN.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateFlashcardSetRequest {

    private String title;

    private String description;

    private Boolean isPublic;

    private String cardType;

    private List<CreateFlashcardRequest> cards;

}