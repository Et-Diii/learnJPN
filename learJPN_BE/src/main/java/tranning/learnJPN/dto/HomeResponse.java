package tranning.learnJPN.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeResponse {

    private Integer totalVocabulary;

    private Integer totalKanji;

    private Integer totalUsers;

    private List<String> featuredWords;

    private List<String> featuredKanji;
}