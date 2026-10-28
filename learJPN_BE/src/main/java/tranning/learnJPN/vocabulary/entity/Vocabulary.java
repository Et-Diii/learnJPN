package tranning.learnJPN.vocabulary.entity;

import jakarta.persistence.*;
import lombok.*;
import tranning.learnJPN.auth.entity.Level;

@Entity
@Table(name = "vocabulary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String word;

    private String hiragana;

    private String romaji;

    @Column(columnDefinition = "TEXT")
    private String meaningVi;

    @Column(columnDefinition = "TEXT")
    private String exampleSentence;

    @Column(columnDefinition = "TEXT")
    private String exampleTranslation;

    private String partOfSpeech;

    private String topic;

    private String kanji;

    private Integer lessonNumber;

    private String lessonTitle;

    @Enumerated(EnumType.STRING)
    private Level jlptLevel;
}
