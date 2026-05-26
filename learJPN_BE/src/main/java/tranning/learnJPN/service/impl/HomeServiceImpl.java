package tranning.learnJPN.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tranning.learnJPN.dto.HomeResponse;
import tranning.learnJPN.entity.Kanji;
import tranning.learnJPN.entity.Vocabulary;
import tranning.learnJPN.repository.KanjiRepository;
import tranning.learnJPN.repository.UserRepository;
import tranning.learnJPN.repository.VocabularyRepository;
import tranning.learnJPN.service.HomeService;

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