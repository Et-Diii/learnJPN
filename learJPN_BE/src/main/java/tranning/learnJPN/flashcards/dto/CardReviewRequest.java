package tranning.learnJPN.flashcards.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardReviewRequest {

    private Long sessionId;

    private Long cardId;

    // AGAIN, HARD, GOOD, EASY
    private String rating;

    // true nếu nhớ/đáp án đúng, false nếu quên/sai
    private Boolean isCorrect;

    // Câu trả lời của người dùng nếu ở chế độ TYPE
    private String userAnswer;

    // Chỉ số thẻ hiện tại (để lưu tiến độ)
    private Integer currentCardIndex;
}
