package tranning.learnJPN.auth.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tranning.learnJPN.auth.dto.LoginRequest;
import tranning.learnJPN.auth.dto.RegisterRequest;
import tranning.learnJPN.auth.entity.Level;
import tranning.learnJPN.auth.entity.User;
import tranning.learnJPN.auth.repository.UserRepository;
import tranning.learnJPN.auth.service.AuthService;
import tranning.learnJPN.common.security.JwtUtil;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .currentLevel(Level.N5)
                .build();

        userRepository.save(user);

        return jwtUtil.generateToken(user.getEmail());
    }

    @Override
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }
        return jwtUtil.generateToken(user.getEmail());
    }
}
