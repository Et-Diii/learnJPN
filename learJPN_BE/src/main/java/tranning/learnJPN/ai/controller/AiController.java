package tranning.learnJPN.ai.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.ai.dto.AiPreviewRequest;
import tranning.learnJPN.ai.dto.AiPreviewResponse;
import tranning.learnJPN.ai.service.AiService;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/preview")
    public AiPreviewResponse askAi(
            @RequestBody AiPreviewRequest request
    ) {

        String reply = aiService.askAi(
                request.getMessage()
        );

        return AiPreviewResponse.builder()
                .reply(reply)
                .build();
    }
}