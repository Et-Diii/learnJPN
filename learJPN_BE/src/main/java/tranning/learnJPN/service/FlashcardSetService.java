package tranning.learnJPN.service;

import tranning.learnJPN.dto.CreateFlashcardSetRequest;

public interface FlashcardSetService {

    void createSet(
            CreateFlashcardSetRequest request,
            String username
    );
}