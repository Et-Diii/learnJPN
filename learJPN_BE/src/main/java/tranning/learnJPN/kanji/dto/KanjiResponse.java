package tranning.learnJPN.kanji.dto;

import lombok.*;
import tranning.learnJPN.auth.entity.Level;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanjiResponse {
    private Long id;
    private String kanji;
    private String onyomi;
    private String kunyomi;
    private String hanViet;
    private String meaningVi;
    private String exampleSentence;
    private String exampleTranslation;
    private Level jlptLevel;
    private String radical;
    private Integer strokeCount;
    private Integer lessonNumber;
    private String lessonTitle;
}
