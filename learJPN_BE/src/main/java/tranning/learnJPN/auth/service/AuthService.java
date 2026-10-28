package tranning.learnJPN.auth.service;

import tranning.learnJPN.auth.dto.LoginRequest;
import tranning.learnJPN.auth.dto.RegisterRequest;

public interface AuthService {

    String register(RegisterRequest request);

    String login(LoginRequest request);
}