package tranning.learnJPN.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tranning.learnJPN.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

        Optional<User> findByUsername(String username);


    boolean existsByEmail(String email);
}
