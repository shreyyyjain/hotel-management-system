package com.shrey.hotel.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.shrey.hotel.model.RefreshToken;
import com.shrey.hotel.model.User;
import com.shrey.hotel.repository.RefreshTokenRepository;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               @Value("${jwt.refresh.expiration}") long refreshExpirationMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public RefreshToken createToken(User user) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiry(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000));
        return refreshTokenRepository.save(token);
    }

    public Optional<RefreshToken> find(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public boolean isExpired(RefreshToken token) {
        return token.getExpiry().isBefore(LocalDateTime.now());
    }

    @org.springframework.transaction.annotation.Transactional
    public void revoke(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(refreshTokenRepository::delete);
    }

    @org.springframework.transaction.annotation.Transactional
    public RefreshToken rotate(RefreshToken existing) {
        revoke(existing.getToken());
        return createToken(existing.getUser());
    }

    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.deleteAllByUser_Id(userId);
    }
}
