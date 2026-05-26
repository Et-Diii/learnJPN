package tranning.learnJPN.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kanji")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Kanji {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Kanji
    private String kanji;

    // Âm ON
    private String onyomi;

    // Âm KUN
    private String kunyomi;

    // Âm Hán Việt
    private String hanViet;

    // Nghĩa tiếng Việt
    @Column(columnDefinition = "TEXT")
    private String meaningVi;

    // Ví dụ tiếng Nhật
    @Column(columnDefinition = "TEXT")
    private String exampleSentence;

    // Dịch ví dụ
    @Column(columnDefinition = "TEXT")
    private String exampleTranslation;

    // JLPT
    @Enumerated(EnumType.STRING)
    private Level jlptLevel;

    // Bộ thủ
    private String radical;

    // Số nét
    private Integer strokeCount;
}