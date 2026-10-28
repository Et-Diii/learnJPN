package tranning.learnJPN.auth.tool;

import org.springframework.boot.SpringApplication;

import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import tranning.learnJPN.LearJpnApplication;
import tranning.learnJPN.auth.entity.User;
import tranning.learnJPN.auth.repository.UserRepository;

public class ResetPasswordTool {

    public static void main(String[] args) {

        ConfigurableApplicationContext context =
                SpringApplication.run(LearJpnApplication.class, args);

        UserRepository userRepository = context.getBean(UserRepository.class);
        PasswordEncoder passwordEncoder = context.getBean(PasswordEncoder.class);

        String username = "donjp"; // đổi user ở đây
        String newPassword = "123456";

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        System.out.println("Reset password success!");
        System.exit(0);
    }
}