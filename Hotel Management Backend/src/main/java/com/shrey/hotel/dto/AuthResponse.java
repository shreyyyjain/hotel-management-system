package com.shrey.hotel.dto;

public class AuthResponse {
    private Long userId;
    private String email;
    private String fullName;
    private String accessToken;
    private String refreshToken;
    private long accessExpiresInMs;

    public AuthResponse() {}

    public AuthResponse(Long userId, String email, String fullName, String accessToken, String refreshToken, long accessExpiresInMs) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.accessExpiresInMs = accessExpiresInMs;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public long getAccessExpiresInMs() { return accessExpiresInMs; }
    public void setAccessExpiresInMs(long accessExpiresInMs) { this.accessExpiresInMs = accessExpiresInMs; }
}
