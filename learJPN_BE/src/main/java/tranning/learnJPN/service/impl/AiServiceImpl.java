package tranning.learnJPN.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tranning.learnJPN.service.AiService;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private final WebClient.Builder webClientBuilder;

    @Override
    public String askAi(String userMessage) {

        String prompt = """
                Bạn là AI Sensei dạy tiếng Nhật.

                Hãy:
                - giải thích dễ hiểu
                - dùng tiếng Việt
                - có ví dụ
                - thân thiện

                
                """ + userMessage;

        String url = "https://openrouter.ai/api/v1/chat/completions";

        Map<String, Object> requestBody = Map.of(
                "model", "openrouter/auto",
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                )
        );

        try {

            Map response =
                    webClientBuilder
                            .build()
                            .post()
                            .uri(url)
                            .header("Authorization", "Bearer " + apiKey)
                            .header("HTTP-Referer", "http://localhost:8080")
                            .header("X-Title", "NihonAI")
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(Map.class)
                            .block();

            System.out.println(response);

            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) response.get("choices");

            Map<String, Object> message =
                    (Map<String, Object>) choices.get(0).get("message");

            return message.get("content").toString();

        } catch (Exception e) {

            e.printStackTrace();

            return "AI lỗi: " + e.getMessage();
        }
    }
}