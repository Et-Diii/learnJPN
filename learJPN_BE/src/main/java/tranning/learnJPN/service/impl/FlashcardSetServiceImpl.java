package tranning.learnJPN.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tranning.learnJPN.dto.CreateFlashcardRequest;
import tranning.learnJPN.dto.CreateFlashcardSetRequest;
import tranning.learnJPN.entity.Flashcard;
import tranning.learnJPN.entity.FlashcardSet;
import tranning.learnJPN.entity.User;
import tranning.learnJPN.repository.FlashcardSetRepository;
import tranning.learnJPN.repository.UserRepository;
import tranning.learnJPN.service.FlashcardSetService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FlashcardSetServiceImpl implements FlashcardSetService {

    private final FlashcardSetRepository flashcardSetRepository;
    private final UserRepository userRepository;

    @Override
    public void createSet(
            CreateFlashcardSetRequest request,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        FlashcardSet set = FlashcardSet.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .isPublic(request.getIsPublic())
                .user(user)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        for (CreateFlashcardRequest cardDto : request.getCards()) {

            Flashcard card = Flashcard.builder()
                    .frontText(cardDto.getFrontText())
                    .backText(cardDto.getBackText())
                    .exampleText(cardDto.getExampleText())
                    .cardType(cardDto.getCardType())
                    .createdAt(LocalDateTime.now())
                    .flashcardSet(set)
                    .build();

            set.getCards().add(card);
        }

        flashcardSetRepository.save(set);
    }
}