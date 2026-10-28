package tranning.learnJPN.dashboard.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tranning.learnJPN.dashboard.dto.HomeResponse;
import tranning.learnJPN.kanji.entity.Kanji;
import tranning.learnJPN.vocabulary.entity.Vocabulary;
import tranning.learnJPN.kanji.repository.KanjiRepository;
import tranning.learnJPN.auth.repository.UserRepository;
import tranning.learnJPN.vocabulary.repository.VocabularyRepository;
import tranning.learnJPN.dashboard.service.HomeService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeServiceImpl implements HomeService {

    private final VocabularyRepository vocabularyRepository;

    private final KanjiRepository kanjiRepository;

    private final UserRepository userRepository;

    @Override
    public HomeResponse getHomeData() {

        List<String> words = vocabularyRepository.findAll()
                .stream()
                .limit(5)
                .map(Vocabulary::getWord)
                .collect(Collectors.toList());

        List<String> kanjis = kanjiRepository.findAll()
                .stream()
                .limit(5)
                .map(Kanji::getKanji)
                .collect(Collectors.toList());

        return HomeResponse.builder()
                .totalVocabulary((int) vocabularyRepository.count())
                .totalKanji((int) kanjiRepository.count())
                .totalUsers((int) userRepository.count())
                .featuredWords(words)
                .featuredKanji(kanjis)
                .build();
    }
}