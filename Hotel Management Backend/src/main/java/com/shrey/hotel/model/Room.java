package com.shrey.hotel.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Integer roomNumber;

    @Column(nullable = false)
    private String roomType; // Standard, Deluxe, Suite

    @Column(nullable = false)
    private BigDecimal pricePerNight;

    @Column(nullable = false)
    private Boolean available = true;

    @Version
    private Long version; // Optimistic locking for concurrent bookings

    public Room() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getRoomNumber() { return roomNumber; }
    public void setRoomNumber(Integer roomNumber) { this.roomNumber = roomNumber; }
    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }
    public BigDecimal getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public synchronized Boolean bookRoom() {
        if (this.available) {
            this.available = false;
            return true;
        }
        return false;
    }

    public synchronized void releaseRoom() {
        this.available = true;
    }
}
