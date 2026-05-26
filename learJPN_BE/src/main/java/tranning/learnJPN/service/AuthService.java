package tranning.learnJPN.service;

import tranning.learnJPN.dto.LoginRequest;
import tranning.learnJPN.dto.RegisterRequest;

public interface AuthService {

    String register(RegisterRequest request);

    String login(LoginRequest request);
}