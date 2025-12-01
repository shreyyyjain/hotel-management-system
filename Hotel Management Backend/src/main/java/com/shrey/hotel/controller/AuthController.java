package com.shrey.hotel.controller;

import com.shrey.hotel.model.User;
import com.shrey.hotel.model.RefreshToken;
import com.shrey.hotel.service.AuthService;
import com.shrey.hotel.service.RefreshTokenService;
import com.shrey.hotel.security.JwtUtil;
import com.shrey.hotel.dto.AuthResponse;
import com.shrey.hotel.dto.LoginRequest;
import com.shrey.hotel.dto.SignupRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Validated
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            User user = authService.register(request.getEmail(), request.getPassword(), request.getFullName());
            String access = jwtUtil.generateAccessToken(user.getEmail(), Map.of("uid", user.getId()));
            RefreshToken rt = refreshTokenService.createToken(user);
            AuthResponse response = new AuthResponse(user.getId(), user.getEmail(), user.getFullName(), access, rt.getToken(), jwtUtil.parseToken(access).getExpiration().getTime() - System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        var userOpt = authService.authenticate(request.getEmail(), request.getPassword());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
        User user = userOpt.get();
        String access = jwtUtil.generateAccessToken(user.getEmail(), Map.of("uid", user.getId()));
        RefreshToken rt = refreshTokenService.createToken(user);
        AuthResponse response = new AuthResponse(user.getId(), user.getEmail(), user.getFullName(), access, rt.getToken(), jwtUtil.parseToken(access).getExpiration().getTime() - System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing refreshToken"));
        }
        var rtOpt = refreshTokenService.find(refreshToken);
        if (rtOpt.isEmpty() || refreshTokenService.isExpired(rtOpt.get())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired refresh token"));
        }
        RefreshToken old = rtOpt.get();
        User user = old.getUser();
        // Rotate refresh token
        refreshTokenService.revoke(old.getToken());
        RefreshToken newRt = refreshTokenService.createToken(user);
        String access = jwtUtil.generateAccessToken(user.getEmail(), Map.of("uid", user.getId()));
        AuthResponse response = new AuthResponse(user.getId(), user.getEmail(), user.getFullName(), access, newRt.getToken(), jwtUtil.parseToken(access).getExpiration().getTime() - System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken != null) {
            refreshTokenService.revoke(refreshToken);
        }
        return ResponseEntity.ok(Map.of("success", true));
    }
}
