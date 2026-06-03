package tranning.learnJPN.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.dto.CreateFlashcardSetRequest;
import tranning.learnJPN.service.FlashcardSetService;

@RestController
@RequestMapping("/api/flashcard-sets")
@RequiredArgsConstructor
public class FlashcardSetController {

    private final FlashcardSetService flashcardSetService;

    @PostMapping
    public String createSet(
            @RequestBody CreateFlashcardSetRequest request,
            Authentication authentication
    ) {

        flashcardSetService.createSet(
                request,
                authentication.getName()
        );

        return "Tạo bộ thẻ thành công";
    }
}