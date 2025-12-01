package com.shrey.hotel.security;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.shrey.hotel.BaseIntegrationTest;

import io.jsonwebtoken.Claims;

public class JwtUtilTests extends BaseIntegrationTest {

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    void generateAccessToken_hasExpectedSubjectAndUidClaim() {
        String token = jwtUtil.generateAccessToken("user@example.com", Map.of("uid", 42L));
        Claims claims = jwtUtil.parseToken(token);
        assertEquals("user@example.com", claims.getSubject());
        assertEquals(42L, ((Number)claims.get("uid")).longValue());
        assertFalse(jwtUtil.isRefreshToken(token));
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void generateRefreshToken_isMarkedAsRefresh() {
        String token = jwtUtil.generateRefreshToken("user@example.com");
        Claims claims = jwtUtil.parseToken(token);
        assertEquals("user@example.com", claims.getSubject());
        assertTrue(jwtUtil.isRefreshToken(token));
        assertTrue(jwtUtil.isTokenValid(token));
    }
}
