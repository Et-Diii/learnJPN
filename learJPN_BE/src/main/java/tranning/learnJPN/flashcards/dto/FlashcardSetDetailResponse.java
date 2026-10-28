package tranning.learnJPN.flashcards.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardSetDetailResponse {

    private Long id;

    private String title;

    private String description;

    private Boolean isPublic;

    private Integer totalCards;

    private String authorName;

    private Boolean isOwner;

    private LocalDateTime createdAt;

    @Builder.Default
    private List<FlashcardDto> cards = new ArrayList<>();

    // Phiên học gần nhất còn dở (nếu có) để frontend hiển thị gợi ý tiếp tục
    private Long activeSessionId;
    private Integer activeSessionLastIndex;
}
