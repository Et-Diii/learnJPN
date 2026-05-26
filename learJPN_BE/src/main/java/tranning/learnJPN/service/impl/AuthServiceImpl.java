package tranning.learnJPN.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tranning.learnJPN.dto.LoginRequest;
import tranning.learnJPN.dto.RegisterRequest;
import tranning.learnJPN.entity.Level;
import tranning.learnJPN.entity.User;
import tranning.learnJPN.repository.UserRepository;
import tranning.learnJPN.service.AuthService;
import tranning.learnJPN.utils.JwtUtil;

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
