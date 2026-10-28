package tranning.learnJPN.flashcards.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionRequest {

    // FLIP, TYPE, QUICK
    @Builder.Default
    private String mode = "FLIP";

    // Tiếp tục phiên học dở nếu có
    @Builder.Default
    private Boolean resumeExisting = true;

    // Xáo trộn thẻ
    @Builder.Default
    private Boolean shuffle = false;

    // Chỉ học các thẻ từng đánh giá sai/quên
    @Builder.Default
    private Boolean onlyWrong = false;
}
