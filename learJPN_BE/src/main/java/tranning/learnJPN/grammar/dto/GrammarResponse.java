package tranning.learnJPN.grammar.dto;

import lombok.*;
import tranning.learnJPN.auth.entity.Level;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarResponse {
    private Long id;
    private String title;
    private String structure;
    private String meaningVi;
    private Level jlptLevel;
    private String topic;
    private Integer lessonNumber;
    private String lessonTitle;
    private String explanation;
    private String cautionNotes;
    private String examples;
}
