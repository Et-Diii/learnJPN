package tranning.learnJPN.flashcards.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tranning.learnJPN.auth.entity.User;
import tranning.learnJPN.auth.repository.UserRepository;
import tranning.learnJPN.flashcards.dto.*;
import tranning.learnJPN.flashcards.entity.Flashcard;
import tranning.learnJPN.flashcards.entity.FlashcardSet;
import tranning.learnJPN.flashcards.entity.FlashcardStudyRecord;
import tranning.learnJPN.flashcards.entity.FlashcardStudySession;
import tranning.learnJPN.flashcards.entity.SavedFlashcardSet;
import tranning.learnJPN.flashcards.repository.*;
import tranning.learnJPN.flashcards.service.FlashcardSetService;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashcardSetServiceImpl implements FlashcardSetService {

    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final UserRepository userRepository;
    private final SavedFlashcardSetRepository savedFlashcardSetRepository;
    private final FlashcardStudySessionRepository studySessionRepository;
    private final FlashcardStudyRecordRepository studyRecordRepository;

    private User getUserByPrincipal(String principal) {
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByUsername(principal))
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashcardSetResponse> getMySets(long userId) {
        return flashcardSetRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(set -> FlashcardSetResponse.builder()
                        .id(set.getId())
                        .title(set.getTitle())
                        .description(set.getDescription())
                        .isPublic(set.getIsPublic())
                        .totalCards(set.getCards() != null ? set.getCards().size() : 0)
                        .cardCount(set.getCards() != null ? set.getCards().size() : 0)
                        .authorName(set.getUser() != null ? set.getUser().getUsername() : "")
                        .isOwner(true)
                        .createdAt(set.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashcardSetResponse> getSavedSets(String principal) {
        User user = getUserByPrincipal(principal);

        return savedFlashcardSetRepository.findByUserId(user.getId())
                .stream()
                .map(saved -> {
                    FlashcardSet set = saved.getFlashcardSet();
                    int count = set.getCards() != null ? set.getCards().size() : 0;
                    return FlashcardSetResponse.builder()
                            .id(set.getId())
                            .title(set.getTitle())
                            .description(set.getDescription())
                            .isPublic(set.getIsPublic())
                            .totalCards(count)
                            .cardCount(count)
                            .authorName(set.getUser() != null ? set.getUser().getUsername() : "")
                            .isOwner(set.getUser() != null && Objects.equals(set.getUser().getId(), user.getId()))
                            .createdAt(set.getCreatedAt())
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashcardSetResponse> getPublicSets() {
        return flashcardSetRepository.findByIsPublicOrderByCreatedAtDesc(true)
                .stream()
                .map(set -> {
                    int count = set.getCards() != null ? set.getCards().size() : 0;
                    return FlashcardSetResponse.builder()
                            .id(set.getId())
                            .title(set.getTitle())
                            .description(set.getDescription())
                            .isPublic(set.getIsPublic())
                            .totalCards(count)
                            .cardCount(count)
                            .authorName(set.getUser() != null ? set.getUser().getUsername() : "")
                            .isOwner(false)
                            .createdAt(set.getCreatedAt())
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional
    public void createSet(CreateFlashcardSetRequest request, String email) {
        User user = getUserByPrincipal(email);

        FlashcardSet set = FlashcardSet.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .user(user)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        if (request.getCards() != null) {
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
        }

        flashcardSetRepository.save(set);
    }

    @Override
    @Transactional
    public void saveSet(Long setId, String principal) {
        User user = getUserByPrincipal(principal);

        FlashcardSet flashcardSet = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Bộ thẻ không tồn tại"));

        boolean exists = savedFlashcardSetRepository.existsByUserAndFlashcardSet(user, flashcardSet);
        if (exists) {
            return;
        }

        SavedFlashcardSet saved = SavedFlashcardSet.builder()
                .user(user)
                .flashcardSet(flashcardSet)
                .savedAt(LocalDateTime.now())
                .build();

        savedFlashcardSetRepository.save(saved);
    }

    @Override
    @Transactional
    public void unsaveSet(Long setId, String principal) {
        User user = getUserByPrincipal(principal);
        FlashcardSet flashcardSet = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Bộ thẻ không tồn tại"));

        savedFlashcardSetRepository.deleteByUserAndFlashcardSet(user, flashcardSet);
    }

    @Override
    @Transactional(readOnly = true)
    public FlashcardSetDetailResponse getSetDetail(Long setId, String principal) {
        User user = getUserByPrincipal(principal);

        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Bộ thẻ không tồn tại"));

        boolean isOwner = set.getUser() != null && Objects.equals(set.getUser().getId(), user.getId());
        if (!Boolean.TRUE.equals(set.getIsPublic()) && !isOwner) {
            throw new RuntimeException("Bạn không có quyền truy cập bộ thẻ riêng tư này");
        }

        List<FlashcardDto> cardDtos = set.getCards() != null
                ? set.getCards().stream()
                .map(c -> FlashcardDto.builder()
                        .id(c.getId())
                        .frontText(c.getFrontText())
                        .backText(c.getBackText())
                        .exampleText(c.getExampleText())
                        .cardType(c.getCardType())
                        .build())
                .toList()
                : Collections.emptyList();

        // Kiểm tra xem có phiên học nào dở dang không
        Optional<FlashcardStudySession> activeSession =
                studySessionRepository.findTopByUserIdAndFlashcardSetIdAndIsCompletedFalseOrderByStartedAtDesc(user.getId(), setId);

        return FlashcardSetDetailResponse.builder()
                .id(set.getId())
                .title(set.getTitle())
                .description(set.getDescription())
                .isPublic(set.getIsPublic())
                .totalCards(cardDtos.size())
                .authorName(set.getUser() != null ? set.getUser().getUsername() : "")
                .isOwner(isOwner)
                .createdAt(set.getCreatedAt())
                .cards(cardDtos)
                .activeSessionId(activeSession.map(FlashcardStudySession::getId).orElse(null))
                .activeSessionLastIndex(activeSession.map(FlashcardStudySession::getLastCardIndex).orElse(null))
                .build();
    }

    @Override
    @Transactional
    public void deleteSet(Long setId, String principal) {
        User user = getUserByPrincipal(principal);
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Bộ thẻ không tồn tại"));

        if (!Objects.equals(set.getUser().getId(), user.getId())) {
            throw new RuntimeException("Chỉ tác giả mới có quyền xóa bộ thẻ này");
        }

        // Xóa bản ghi đã lưu của người khác trước
        savedFlashcardSetRepository.deleteByFlashcardSetId(setId);
        flashcardSetRepository.delete(set);
    }

    @Override
    @Transactional
    public void updateVisibility(Long setId, Boolean isPublic, String principal) {
        User user = getUserByPrincipal(principal);
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Bộ thẻ không tồn tại"));

        if (!Objects.equals(set.getUser().getId(), user.getId())) {
            throw new RuntimeException("Chỉ tác giả mới có quyền đổi trạng thái bộ thẻ này");
        }

        set.setIsPublic(isPublic);
        set.setUpdatedAt(LocalDateTime.now());
        flashcardSetRepository.save(set);
    }

    @Override
    @Transactional
    public StudySessionResponse startOrResumeSession(Long setId, StudySessionRequest request, String principal) {
        User user = getUserByPrincipal(principal);
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Bộ thẻ không tồn tại"));

        boolean isOwner = set.getUser() != null && Objects.equals(set.getUser().getId(), user.getId());
        if (!Boolean.TRUE.equals(set.getIsPublic()) && !isOwner) {
            throw new RuntimeException("Bạn không có quyền học bộ thẻ riêng tư này");
        }

        List<Flashcard> cards = set.getCards() != null ? new ArrayList<>(set.getCards()) : new ArrayList<>();
        if (cards.isEmpty()) {
            throw new RuntimeException("Bộ thẻ này hiện chưa có thẻ nào để học");
        }

        // Kiểm tra resume
        if (Boolean.TRUE.equals(request.getResumeExisting())) {
            Optional<FlashcardStudySession> existing =
                    studySessionRepository.findTopByUserIdAndFlashcardSetIdAndIsCompletedFalseOrderByStartedAtDesc(user.getId(), setId);
            if (existing.isPresent()) {
                FlashcardStudySession session = existing.get();
                List<FlashcardDto> cardDtos = cards.stream()
                        .map(c -> FlashcardDto.builder()
                                .id(c.getId())
                                .frontText(c.getFrontText())
                                .backText(c.getBackText())
                                .exampleText(c.getExampleText())
                                .cardType(c.getCardType())
                                .build())
                        .toList();

                return StudySessionResponse.builder()
                        .sessionId(session.getId())
                        .setId(set.getId())
                        .setTitle(set.getTitle())
                        .mode(session.getStudyMode())
                        .lastCardIndex(session.getLastCardIndex() != null ? session.getLastCardIndex() : 0)
                        .totalCards(session.getTotalCards())
                        .correctCount(session.getCorrectCount() != null ? session.getCorrectCount() : 0)
                        .wrongCount(session.getWrongCount() != null ? session.getWrongCount() : 0)
                        .cards(cardDtos)
                        .build();
            }
        }

        // Tạo phiên học mới
        if (Boolean.TRUE.equals(request.getShuffle())) {
            Collections.shuffle(cards);
        }

        String mode = request.getMode() != null ? request.getMode() : "FLIP";

        FlashcardStudySession newSession = FlashcardStudySession.builder()
                .user(user)
                .flashcardSet(set)
                .studyMode(mode)
                .lastCardIndex(0)
                .totalCards(cards.size())
                .correctCount(0)
                .wrongCount(0)
                .isCompleted(false)
                .startedAt(LocalDateTime.now())
                .build();

        FlashcardStudySession savedSession = studySessionRepository.save(newSession);

        List<FlashcardDto> cardDtos = cards.stream()
                .map(c -> FlashcardDto.builder()
                        .id(c.getId())
                        .frontText(c.getFrontText())
                        .backText(c.getBackText())
                        .exampleText(c.getExampleText())
                        .cardType(c.getCardType())
                        .build())
                .toList();

        return StudySessionResponse.builder()
                .sessionId(savedSession.getId())
                .setId(set.getId())
                .setTitle(set.getTitle())
                .mode(mode)
                .lastCardIndex(0)
                .totalCards(cards.size())
                .correctCount(0)
                .wrongCount(0)
                .cards(cardDtos)
                .build();
    }

    @Override
    @Transactional
    public void recordCardReview(CardReviewRequest request, String principal) {
        User user = getUserByPrincipal(principal);

        FlashcardStudySession session = studySessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Phiên học không tồn tại"));

        if (!Objects.equals(session.getUser().getId(), user.getId())) {
            throw new RuntimeException("Không có quyền cập nhật phiên học này");
        }

        Flashcard card = flashcardRepository.findById(request.getCardId())
                .orElseThrow(() -> new RuntimeException("Thẻ không tồn tại"));

        FlashcardStudyRecord record = FlashcardStudyRecord.builder()
                .session(session)
                .user(user)
                .card(card)
                .rating(request.getRating())
                .isCorrect(request.getIsCorrect())
                .userAnswer(request.getUserAnswer())
                .reviewedAt(LocalDateTime.now())
                .build();

        studyRecordRepository.save(record);

        // Cập nhật thống kê phiên học
        if (Boolean.TRUE.equals(request.getIsCorrect())) {
            session.setCorrectCount(session.getCorrectCount() + 1);
        } else {
            session.setWrongCount(session.getWrongCount() + 1);
        }

        if (request.getCurrentCardIndex() != null) {
            session.setLastCardIndex(request.getCurrentCardIndex());
        }

        studySessionRepository.save(session);
    }

    @Override
    @Transactional
    public SessionSummaryResponse completeSession(Long sessionId, CompleteSessionRequest request, String principal) {
        User user = getUserByPrincipal(principal);

        FlashcardStudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên học không tồn tại"));

        if (!Objects.equals(session.getUser().getId(), user.getId())) {
            throw new RuntimeException("Không có quyền thao tác trên phiên học này");
        }

        session.setIsCompleted(true);
        session.setCompletedAt(LocalDateTime.now());
        if (request != null && request.getDurationSeconds() != null) {
            session.setDurationSeconds(request.getDurationSeconds());
        }
        studySessionRepository.save(session);

        return getSessionSummary(sessionId, principal);
    }

    @Override
    @Transactional(readOnly = true)
    public SessionSummaryResponse getSessionSummary(Long sessionId, String principal) {
        User user = getUserByPrincipal(principal);

        FlashcardStudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên học không tồn tại"));

        if (!Objects.equals(session.getUser().getId(), user.getId())) {
            throw new RuntimeException("Không có quyền xem phiên học này");
        }

        List<FlashcardStudyRecord> wrongRecords = studyRecordRepository.findBySessionIdAndIsCorrectFalse(sessionId);
        Map<Long, FlashcardDto> uniqueWrongCards = new LinkedHashMap<>();

        for (FlashcardStudyRecord record : wrongRecords) {
            Flashcard c = record.getCard();
            if (c != null && !uniqueWrongCards.containsKey(c.getId())) {
                uniqueWrongCards.put(c.getId(), FlashcardDto.builder()
                        .id(c.getId())
                        .frontText(c.getFrontText())
                        .backText(c.getBackText())
                        .exampleText(c.getExampleText())
                        .cardType(c.getCardType())
                        .build());
            }
        }

        return SessionSummaryResponse.builder()
                .sessionId(session.getId())
                .setId(session.getFlashcardSet().getId())
                .setTitle(session.getFlashcardSet().getTitle())
                .mode(session.getStudyMode())
                .totalCards(session.getTotalCards())
                .correctCount(session.getCorrectCount())
                .wrongCount(session.getWrongCount())
                .durationSeconds(session.getDurationSeconds() != null ? session.getDurationSeconds() : 0)
                .wrongCards(new ArrayList<>(uniqueWrongCards.values()))
                .build();
    }
}