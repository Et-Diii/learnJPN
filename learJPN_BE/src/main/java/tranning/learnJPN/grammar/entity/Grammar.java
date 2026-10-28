package tranning.learnJPN.grammar.entity;

import jakarta.persistence.*;
import lombok.*;
import tranning.learnJPN.auth.entity.Level;

@Entity
@Table(name = "grammar")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grammar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String structure;

    @Column(columnDefinition = "TEXT")
    private String meaningVi;

    @Enumerated(EnumType.STRING)
    private Level jlptLevel;

    private String topic;

    private Integer lessonNumber;

    private String lessonTitle;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String cautionNotes;

    @Column(columnDefinition = "TEXT")
    private String examples;
}
