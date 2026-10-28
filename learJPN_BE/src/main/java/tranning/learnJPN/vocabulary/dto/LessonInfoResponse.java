package tranning.learnJPN.vocabulary.dto;

import lombok.*;
import tranning.learnJPN.auth.entity.Level;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonInfoResponse {
    private Integer lessonNumber;
    private String lessonTitle;
    private Long totalItems;
    private Level level;
}
