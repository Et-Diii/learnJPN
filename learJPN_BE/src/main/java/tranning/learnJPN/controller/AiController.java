package tranning.learnJPN.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.dto.AiPreviewRequest;
import tranning.learnJPN.dto.AiPreviewResponse;
import tranning.learnJPN.service.AiService;

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