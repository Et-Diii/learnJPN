package tranning.learnJPN.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.grammar.entity.Grammar;
import tranning.learnJPN.grammar.repository.GrammarRepository;
import tranning.learnJPN.kanji.entity.Kanji;
import tranning.learnJPN.kanji.repository.KanjiRepository;
import tranning.learnJPN.vocabulary.entity.Vocabulary;
import tranning.learnJPN.vocabulary.repository.VocabularyRepository;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;
    private final KanjiRepository kanjiRepository;

    @Override
    public void run(String... args) {
        initVocabularyData();
        initGrammarData();
        initKanjiData();
    }

    private void initVocabularyData() {
        if (vocabularyRepository.count() > 0) {
            return;
        }

        log.info("Kho từ vựng trống. Đang tự động nạp dữ liệu từ vựng mẫu chia theo Bài học...");

        List<Vocabulary> sampleVocabs = List.of(
                // ===== BÀI 1: CHÀO HỎI & LÀM QUEN =====
                Vocabulary.builder()
                        .word("わたし")
                        .hiragana("わたし")
                        .romaji("watashi")
                        .meaningVi("Tôi, bản thân tôi")
                        .partOfSpeech("Đại từ")
                        .topic("Chào hỏi")
                        .lessonNumber(1)
                        .lessonTitle("Bài 1: Chào hỏi & Làm quen")
                        .jlptLevel(Level.N5)
                        .exampleSentence("わたしはアンと申します。")
                        .exampleTranslation("Tôi tên là An.")
                        .build(),

                Vocabulary.builder()
                        .word("先生")
                        .hiragana("せんせい")
                        .romaji("sensei")
                        .meaningVi("Thầy cô giáo, bác sĩ")
                        .partOfSpeech("Danh từ")
                        .topic("Trường học")
                        .kanji("先 (Tiên) + 生 (Sinh)")
                        .lessonNumber(1)
                        .lessonTitle("Bài 1: Chào hỏi & Làm quen")
                        .jlptLevel(Level.N5)
                        .exampleSentence("田中先生は日本語を教えます。")
                        .exampleTranslation("Thầy Tanaka dạy tiếng Nhật.")
                        .build(),

                Vocabulary.builder()
                        .word("学生")
                        .hiragana("がくせい")
                        .romaji("gakusei")
                        .meaningVi("Học sinh, sinh viên")
                        .partOfSpeech("Danh từ")
                        .topic("Trường học")
                        .kanji("学 (Học) + 生 (Sinh)")
                        .lessonNumber(1)
                        .lessonTitle("Bài 1: Chào hỏi & Làm quen")
                        .jlptLevel(Level.N5)
                        .exampleSentence("わたしはハノイ大学の学生です。")
                        .exampleTranslation("Tôi là sinh viên trường Đại học Hà Nội.")
                        .build(),

                Vocabulary.builder()
                        .word("会社員")
                        .hiragana("かいしゃいん")
                        .romaji("kaishain")
                        .meaningVi("Nhân viên công ty")
                        .partOfSpeech("Danh từ")
                        .topic("Công việc")
                        .kanji("会 (Hội) + 社 (Xã) + 員 (Viên)")
                        .lessonNumber(1)
                        .lessonTitle("Bài 1: Chào hỏi & Làm quen")
                        .jlptLevel(Level.N5)
                        .exampleSentence("父はIT会社の会社員です。")
                        .exampleTranslation("Bố tôi là nhân viên một công ty công nghệ.")
                        .build(),

                // ===== BÀI 2: ĐỒ VẬT XUNG QUANH =====
                Vocabulary.builder()
                        .word("本")
                        .hiragana("ほん")
                        .romaji("hon")
                        .meaningVi("Quyển sách")
                        .partOfSpeech("Danh từ")
                        .topic("Đồ vật")
                        .kanji("本 (Bản/Bổn)")
                        .lessonNumber(2)
                        .lessonTitle("Bài 2: Đồ vật xung quanh")
                        .jlptLevel(Level.N5)
                        .exampleSentence("これは日本語の本です。")
                        .exampleTranslation("Đây là cuốn sách tiếng Nhật.")
                        .build(),

                Vocabulary.builder()
                        .word("辞書")
                        .hiragana("じしょ")
                        .romaji("jisho")
                        .meaningVi("Từ điển")
                        .partOfSpeech("Danh từ")
                        .topic("Đồ vật")
                        .kanji("辞 (Từ) + 書 (Thư)")
                        .lessonNumber(2)
                        .lessonTitle("Bài 2: Đồ vật xung quanh")
                        .jlptLevel(Level.N5)
                        .exampleSentence("電子辞書を使っています。")
                        .exampleTranslation("Tôi đang dùng từ điển điện tử.")
                        .build(),

                Vocabulary.builder()
                        .word("傘")
                        .hiragana("かさ")
                        .romaji("kasa")
                        .meaningVi("Cái ô, dù")
                        .partOfSpeech("Danh từ")
                        .topic("Đồ vật")
                        .kanji("傘 (Tản)")
                        .lessonNumber(2)
                        .lessonTitle("Bài 2: Đồ vật xung quanh")
                        .jlptLevel(Level.N5)
                        .exampleSentence("雨が降るので、傘を持って行きます。")
                        .exampleTranslation("Vì trời mưa nên tôi mang theo ô.")
                        .build(),

                // ===== BÀI 3: SINH HOẠT & ĂN UỐNG =====
                Vocabulary.builder()
                        .word("食べる")
                        .hiragana("たべる")
                        .romaji("taberu")
                        .meaningVi("Ăn")
                        .partOfSpeech("Động từ nhóm 2")
                        .topic("Ẩm thực")
                        .kanji("食 (Thực)")
                        .lessonNumber(3)
                        .lessonTitle("Bài 3: Sinh hoạt & Ăn uống")
                        .jlptLevel(Level.N5)
                        .exampleSentence("毎朝パンを食べます。")
                        .exampleTranslation("Mỗi sáng tôi đều ăn bánh mì.")
                        .build(),

                Vocabulary.builder()
                        .word("飲む")
                        .hiragana("のむ")
                        .romaji("nomu")
                        .meaningVi("Uống")
                        .partOfSpeech("Động từ nhóm 1")
                        .topic("Ẩm thực")
                        .kanji("飲 (Ẩm)")
                        .lessonNumber(3)
                        .lessonTitle("Bài 3: Sinh hoạt & Ăn uống")
                        .jlptLevel(Level.N5)
                        .exampleSentence("水をたくさん飲みましょう。")
                        .exampleTranslation("Hãy uống thật nhiều nước nhé.")
                        .build(),

                Vocabulary.builder()
                        .word("美味しい")
                        .hiragana("おいしい")
                        .romaji("oishii")
                        .meaningVi("Ngon miệng")
                        .partOfSpeech("Tính từ đuôi い")
                        .topic("Ẩm thực")
                        .kanji("美 (Mỹ) + 味 (Vị)")
                        .lessonNumber(3)
                        .lessonTitle("Bài 3: Sinh hoạt & Ăn uống")
                        .jlptLevel(Level.N5)
                        .exampleSentence("このラーメンは本当に美味しいです。")
                        .exampleTranslation("Món mì ramen này thật sự rất ngon.")
                        .build(),

                // ===== BÀI 4: DU LỊCH & TRẢI NGHIỆM (N4) =====
                Vocabulary.builder()
                        .word("旅行")
                        .hiragana("りょこう")
                        .romaji("ryokou")
                        .meaningVi("Chuyến đi du lịch")
                        .partOfSpeech("Danh từ / Động từ nhóm 3")
                        .topic("Du lịch")
                        .kanji("旅 (Lữ) + 行 (Hành)")
                        .lessonNumber(4)
                        .lessonTitle("Bài 4: Du lịch & Trải nghiệm")
                        .jlptLevel(Level.N4)
                        .exampleSentence("来月京都へ旅行に行きたいです。")
                        .exampleTranslation("Tháng sau tôi muốn đi du lịch Kyoto.")
                        .build(),

                Vocabulary.builder()
                        .word("経験")
                        .hiragana("けいけん")
                        .romaji("keiken")
                        .meaningVi("Kinh nghiệm, trải nghiệm")
                        .partOfSpeech("Danh từ / Động từ nhóm 3")
                        .topic("Công việc")
                        .kanji("経 (Kinh) + 験 (Nghiệm)")
                        .lessonNumber(4)
                        .lessonTitle("Bài 4: Du lịch & Trải nghiệm")
                        .jlptLevel(Level.N4)
                        .exampleSentence("日本でのアルバイトはいい経験になりました。")
                        .exampleTranslation("Làm thêm tại Nhật Bản đã trở thành trải nghiệm rất tốt.")
                        .build()
        );

        vocabularyRepository.saveAll(sampleVocabs);
        log.info("Đã nạp thành công {} từ vựng mẫu chia theo bài học!", sampleVocabs.size());
    }

    private void initGrammarData() {
        if (grammarRepository.count() > 0) {
            return;
        }

        log.info("Kho ngữ pháp trống. Đang tự động nạp dữ liệu ngữ pháp mẫu chia theo Bài học...");

        List<Grammar> sampleGrammar = List.of(
                // ===== BÀI 1: CÂU KHẲNG ĐỊNH, PHỦ ĐỊNH CƠ BẢN =====
                Grammar.builder()
                        .title("N1 は N2 です")
                        .structure("N1 は + N2 です")
                        .meaningVi("N1 là N2 (Khẳng định lịch sự)")
                        .jlptLevel(Level.N5)
                        .topic("Khẳng định cơ bản")
                        .lessonNumber(1)
                        .lessonTitle("Bài 1: Khẳng định & Giới thiệu bản thân")
                        .explanation("Cấu trúc cơ bản nhất trong tiếng Nhật, dùng để xác định danh tính, nghề nghiệp, quốc tịch của chủ ngữ.")
                        .cautionNotes("Trợ từ は viết là 'ha' nhưng luôn đọc là 'wa'.")
                        .examples("• わたしは学生です。(Tôi là học sinh)\n• 田中さんは先生です。(Anh Tanaka là giáo viên)")
                        .build(),

                Grammar.builder()
                        .title("N1 は N2 じゃありません / ではありません")
                        .structure("N1 は + N2 じゃありません")
                        .meaningVi("N1 không phải là N2 (Phủ định lịch sự)")
                        .jlptLevel(Level.N5)
                        .topic("Phủ định cơ bản")
                        .lessonNumber(1)
                        .lessonTitle("Bài 1: Khẳng định & Giới thiệu bản thân")
                        .explanation("Thể phủ định của です. Trong văn nói hàng ngày thường dùng じゃありません, trong văn viết trang trọng dùng ではありません.")
                        .cautionNotes("Không dùng じゃありません với tính từ đuôi い.")
                        .examples("• わたしは医者じゃありません。(Tôi không phải là bác sĩ)\n• あの人は日本人ではありません。(Người đó không phải người Nhật)")
                        .build(),

                // ===== BÀI 2: ĐẠI TỪ CHỈ ĐỊNH =====
                Grammar.builder()
                        .title("これ / それ / あれ は N です")
                        .structure("これ/それ/あれ + は + N です")
                        .meaningVi("Cái này / Cái đó / Cái kia là N")
                        .jlptLevel(Level.N5)
                        .topic("Chỉ định đồ vật")
                        .lessonNumber(2)
                        .lessonTitle("Bài 2: Đồ vật & Sở hữu")
                        .explanation("これ: vật ở gần người nói. それ: vật ở gần người nghe. あれ: vật ở xa cả hai người.")
                        .cautionNotes("Sau これ/それ/あれ là trợ từ は, không đi trực tiếp với danh từ.")
                        .examples("• これはわたしの傘です。(Cái này là ô của tôi)\n• それは日本語の辞書です。(Cái đó là từ điển tiếng Nhật)")
                        .build(),

                // ===== BÀI 3: QUY TẮC & CHO PHÉP =====
                Grammar.builder()
                        .title("〜てはいけません")
                        .structure("V-て + はいけません")
                        .meaningVi("Không được làm... (Cấm đoán nhẹ nhàng, lịch sự)")
                        .jlptLevel(Level.N5)
                        .topic("Cấm đoán & Quy tắc")
                        .lessonNumber(3)
                        .lessonTitle("Bài 3: Thể Te, Quy tắc & Xin phép")
                        .explanation("Dùng khi thông báo quy tắc, nội quy cấm một hành vi nào đó ở nơi công cộng hoặc người trên nhắc nhở người dưới.")
                        .cautionNotes("Không dùng với cấp trên hoặc người lớn tuổi hơn vì mang tính áp đặt quy tắc.")
                        .examples("• ここで写真を撮ってはいけません。(Không được chụp ảnh ở đây)\n• テスト中に話してはいけません。(Trong giờ kiểm tra không được nói chuyện)")
                        .build(),

                Grammar.builder()
                        .title("〜てもいいです")
                        .structure("V-て + もいいです")
                        .meaningVi("Làm... cũng được / Có thể làm... (Cho phép)")
                        .jlptLevel(Level.N5)
                        .topic("Cho phép & Quyền lợi")
                        .lessonNumber(3)
                        .lessonTitle("Bài 3: Thể Te, Quy tắc & Xin phép")
                        .explanation("Dùng để cho phép đối phương làm gì, hoặc khi thêm trợ từ か thành câu hỏi xin phép: 〜てもいいですか (Tôi có thể... được không?).")
                        .cautionNotes("Khi trả lời đồng ý cho câu hỏi xin phép, có thể nói 'ええ、いいですよ'.")
                        .examples("• タバコを吸ってもいいですか。(Tôi có thể hút thuốc ở đây được không?)\n• この本を借りてもいいです。(Bạn có thể mượn cuốn sách này)")
                        .build(),

                // ===== BÀI 4: KINH NGHIỆM & LỜI KHUYÊN (N4) =====
                Grammar.builder()
                        .title("〜たことがあります")
                        .structure("V-た + ことがあります")
                        .meaningVi("Đã từng làm... (Nói về kinh nghiệm trong quá khứ)")
                        .jlptLevel(Level.N5)
                        .topic("Kinh nghiệm")
                        .lessonNumber(4)
                        .lessonTitle("Bài 4: Trải nghiệm & Lời khuyên")
                        .explanation("Dùng để biểu thị một hành động đã từng xảy ra như một trải nghiệm trong đời, không dùng cho các thói quen hàng ngày.")
                        .cautionNotes("Khác với thì quá khứ đơn thuần (V-ました). V-ました chỉ nói hành động xảy ra lúc nào, còn V-たことがあります nhấn mạnh việc từng có kinh nghiệm đó.")
                        .examples("• 富士山に登ったことがあります。(Tôi đã từng leo núi Phú Sĩ)\n• 寿司を食べたことがありません。(Tôi chưa từng ăn món Sushi bao giờ)")
                        .build(),

                Grammar.builder()
                        .title("〜ほうがいいです")
                        .structure("V-た / V-ない + ほうがいいです")
                        .meaningVi("Nên làm... / Không nên làm... (Lời khuyên)")
                        .jlptLevel(Level.N4)
                        .topic("Lời khuyên")
                        .lessonNumber(4)
                        .lessonTitle("Bài 4: Trải nghiệm & Lời khuyên")
                        .explanation("Dùng khi đưa ra lời khuyên cụ thể trong một tình huống nhất định cho đối phương.")
                        .cautionNotes("Khuyên nên làm thì chia thể V-た, khuyên không nên làm thì chia thể V-ない (chứ không dùng V-る).")
                        .examples("• 病院へ行ったほうがいいですよ。(Bạn nên đi bệnh viện khám đi nhé)\n• 夜遅くお酒を飲まないほうがいいです。(Không nên uống rượu bia quá khuya)")
                        .build()
        );

        grammarRepository.saveAll(sampleGrammar);
        log.info("Đã nạp thành công {} điểm ngữ pháp mẫu chia theo bài học!", sampleGrammar.size());
    }

    private void initKanjiData() {
        if (kanjiRepository.count() > 0) {
            return;
        }

        log.info("Kho Kanji trống. Đang tự động nạp dữ liệu chữ Hán mẫu chia theo Bài học...");

        List<Kanji> sampleKanji = List.of(
                // ===== BÀI 1: CHỮ SỐ CƠ BẢN =====
                Kanji.builder()
                        .kanji("一")
                        .hanViet("NHẤT")
                        .onyomi("イチ (ichi), イツ (itsu)")
                        .kunyomi("ひと (hito), ひとつ (hitotsu)")
                        .meaningVi("Số một, một mình, đứng đầu")
                        .radical("一 (Nhất)")
                        .strokeCount(1)
                        .lessonNumber(1)
                        .lessonTitle("Bài 1: Chữ số cơ bản")
                        .jlptLevel(Level.N5)
                        .exampleSentence("一人で旅行に行きます。")
                        .exampleTranslation("Tôi đi du lịch một mình.")
                        .build(),

                Kanji.builder()
                        .kanji("二")
                        .hanViet("NHỊ")
                        .onyomi("ニ (ni), ジ (ji)")
                        .kunyomi("ふた (futa), ふたつ (futatsu)")
                        .meaningVi("Số hai, thứ hai, lặp lại")
                        .radical("二 (Nhị)")
                        .strokeCount(2)
                        .lessonNumber(1)
                        .lessonTitle("Bài 1: Chữ số cơ bản")
                        .jlptLevel(Level.N5)
                        .exampleSentence("リンゴを二つ買いました。")
                        .exampleTranslation("Tôi đã mua hai quả táo.")
                        .build(),

                Kanji.builder()
                        .kanji("三")
                        .hanViet("TAM")
                        .onyomi("サン (san)")
                        .kunyomi("み (mi), みつ (mitsu), みっつ (mittsu)")
                        .meaningVi("Số ba, thứ ba")
                        .radical("一 (Nhất)")
                        .strokeCount(3)
                        .lessonNumber(1)
                        .lessonTitle("Bài 1: Chữ số cơ bản")
                        .jlptLevel(Level.N5)
                        .exampleSentence("三月は桜の季節です。")
                        .exampleTranslation("Tháng ba là mùa hoa anh đào nở.")
                        .build(),

                // ===== BÀI 2: THỜI GIAN & THIÊN NHIÊN =====
                Kanji.builder()
                        .kanji("日")
                        .hanViet("NHẬT")
                        .onyomi("ニチ (nichi), ジツ (jitsu)")
                        .kunyomi("ひ (hi), び (bi), か (ka)")
                        .meaningVi("Mặt trời, ngày, nước Nhật")
                        .radical("日 (Nhật)")
                        .strokeCount(4)
                        .lessonNumber(2)
                        .lessonTitle("Bài 2: Thời gian & Thiên nhiên")
                        .jlptLevel(Level.N5)
                        .exampleSentence("日曜日が好きです。")
                        .exampleTranslation("Tôi rất thích ngày chủ nhật.")
                        .build(),

                Kanji.builder()
                        .kanji("月")
                        .hanViet("NGUYỆT")
                        .onyomi("ゲツ (getsu), ガツ (gatsu)")
                        .kunyomi("つき (tsuki)")
                        .meaningVi("Mặt trăng, tháng")
                        .radical("月 (Nguyệt)")
                        .strokeCount(4)
                        .lessonNumber(2)
                        .lessonTitle("Bài 2: Thời gian & Thiên nhiên")
                        .jlptLevel(Level.N5)
                        .exampleSentence("今夜の月はとても綺麗です。")
                        .exampleTranslation("Mặt trăng tối nay thật là đẹp.")
                        .build(),

                Kanji.builder()
                        .kanji("山")
                        .hanViet("SƠN / SAN")
                        .onyomi("サン (san), セン (sen)")
                        .kunyomi("やま (yama)")
                        .meaningVi("Núi, ngọn núi")
                        .radical("山 (Sơn)")
                        .strokeCount(3)
                        .lessonNumber(2)
                        .lessonTitle("Bài 2: Thời gian & Thiên nhiên")
                        .jlptLevel(Level.N5)
                        .exampleSentence("休日に山へ登ります。")
                        .exampleTranslation("Tôi đi leo núi vào ngày nghỉ.")
                        .build(),

                // ===== BÀI 3: CON NGƯỜI & HÀNH ĐỘNG =====
                Kanji.builder()
                        .kanji("人")
                        .hanViet("NHÂN")
                        .onyomi("ジン (jin), ニン (nin)")
                        .kunyomi("ひと (hito)")
                        .meaningVi("Con người, người")
                        .radical("人 (Nhân)")
                        .strokeCount(2)
                        .lessonNumber(3)
                        .lessonTitle("Bài 3: Con người & Hành động")
                        .jlptLevel(Level.N5)
                        .exampleSentence("あの人はベトナム人です。")
                        .exampleTranslation("Người kia là người Việt Nam.")
                        .build(),

                Kanji.builder()
                        .kanji("食")
                        .hanViet("THỰC")
                        .onyomi("ショク (shoku), ジキ (jiki)")
                        .kunyomi("た・べる (taberu), く・う (kuu)")
                        .meaningVi("Ăn, thức ăn, ẩm thực")
                        .radical("食 (Thực)")
                        .strokeCount(9)
                        .lessonNumber(3)
                        .lessonTitle("Bài 3: Con người & Hành động")
                        .jlptLevel(Level.N5)
                        .exampleSentence("日本料理を毎日食べます。")
                        .exampleTranslation("Tôi ăn món Nhật mỗi ngày.")
                        .build(),

                Kanji.builder()
                        .kanji("生")
                        .hanViet("SINH")
                        .onyomi("セイ (sei), ショウ (shou)")
                        .kunyomi("い・きる (ikiru), う・まれる (umareru)")
                        .meaningVi("Sống, sinh sôi, học trò")
                        .radical("生 (Sinh)")
                        .strokeCount(5)
                        .lessonNumber(3)
                        .lessonTitle("Bài 3: Con người & Hành động")
                        .jlptLevel(Level.N5)
                        .exampleSentence("先生はいつも元気です。")
                        .exampleTranslation("Thầy giáo lúc nào cũng tràn đầy năng lượng.")
                        .build()
        );

        kanjiRepository.saveAll(sampleKanji);
        log.info("Đã nạp thành công {} chữ Kanji mẫu chia theo bài học!", sampleKanji.size());
    }
}
