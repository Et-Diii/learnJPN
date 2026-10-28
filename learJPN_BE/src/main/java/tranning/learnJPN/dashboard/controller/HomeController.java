package tranning.learnJPN.dashboard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.dashboard.dto.HomeResponse;
import tranning.learnJPN.dashboard.service.HomeService;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
@CrossOrigin("*")
public class HomeController {

    private final HomeService homeService;

    @GetMapping
    public HomeResponse getHomePage() {
        return homeService.getHomeData();
    }
}