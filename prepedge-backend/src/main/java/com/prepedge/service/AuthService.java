package com.prepedge.service;

import com.prepedge.dto.request.LoginRequest;
import com.prepedge.dto.request.RegisterRequest;
import com.prepedge.dto.response.AuthResponse;
import com.prepedge.entity.Role;
import com.prepedge.entity.User;
import com.prepedge.repository.UserRepository;
import com.prepedge.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Determine role — defaults to ROLE_STUDENT
        boolean isRecruiter = "ROLE_RECRUITER".equalsIgnoreCase(request.getRole());
        Role role = isRecruiter ? Role.ROLE_RECRUITER : Role.ROLE_STUDENT;

        // Recruiters store company name in the college field
        String collegeOrCompany = isRecruiter
                ? request.getCompanyName()
                : request.getCollege();

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .college(collegeOrCompany)
                .role(role)
                .build();

        userRepository.save(user);

        // Send welcome email asynchronously — does not block the response
        emailService.sendWelcomeEmail(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCollege()
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCollege()
        );
    }
}