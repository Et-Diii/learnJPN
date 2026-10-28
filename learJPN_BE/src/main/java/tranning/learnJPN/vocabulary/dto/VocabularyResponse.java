package tranning.learnJPN.vocabulary.dto;

import lombok.*;
import tranning.learnJPN.auth.entity.Level;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyResponse {
    private Long id;
    private String word;
    private String hiragana;
    private String romaji;
    private String meaningVi;
    private String exampleSentence;
    private String exampleTranslation;
    private String partOfSpeech;
    private String topic;
    private String kanji;
    private Integer lessonNumber;
    private String lessonTitle;
    private Level jlptLevel;
}
