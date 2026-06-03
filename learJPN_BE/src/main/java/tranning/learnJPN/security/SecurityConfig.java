package tranning.learnJPN.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth

                        // Auth
                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        // Flashcard
                        .requestMatchers("/api/flashcards/**")
                        .permitAll()

                        .requestMatchers("/api/flashcard-sets/**")
                        .permitAll()

                        // Các API khác
                        .anyRequest()
                        .permitAll()
                );

        return http.build();
    }
}