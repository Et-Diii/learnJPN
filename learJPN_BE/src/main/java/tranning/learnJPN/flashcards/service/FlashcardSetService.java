package tranning.learnJPN.flashcards.service;

import tranning.learnJPN.flashcards.dto.*;

import java.util.List;

public interface FlashcardSetService {

    void createSet(CreateFlashcardSetRequest request, String email);

    void saveSet(Long setId, String email);

    void unsaveSet(Long setId, String email);

    List<FlashcardSetResponse> getMySets(long userId);

    List<FlashcardSetResponse> getSavedSets(String email);

    List<FlashcardSetResponse> getPublicSets();

    FlashcardSetDetailResponse getSetDetail(Long setId, String email);

    void deleteSet(Long setId, String email);

    void updateVisibility(Long setId, Boolean isPublic, String email);

    StudySessionResponse startOrResumeSession(Long setId, StudySessionRequest request, String email);

    void recordCardReview(CardReviewRequest request, String email);

    SessionSummaryResponse completeSession(Long sessionId, CompleteSessionRequest request, String email);

    SessionSummaryResponse getSessionSummary(Long sessionId, String email);
}