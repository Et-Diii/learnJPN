package tranning.learnJPN.auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tranning.learnJPN.auth.dto.LoginRequest;
import tranning.learnJPN.auth.dto.RegisterRequest;
import tranning.learnJPN.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
