package com.shrey.hotel.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "booking_rooms",
        joinColumns = @JoinColumn(name = "booking_id"),
        inverseJoinColumns = @JoinColumn(name = "room_id")
    )
    private List<Room> rooms;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "booking_food_items",
        joinColumns = @JoinColumn(name = "booking_id"),
        inverseJoinColumns = @JoinColumn(name = "food_item_id")
    )
    private List<FoodItem> foodItems;

    @Column(name = "food_quantities")
    private String foodQuantities; // JSON: {"1": 2, "3": 1} or Map in separate table

    @Column(name = "check_in_date")
    private java.time.LocalDate checkInDate;

    @Column(name = "check_out_date")
    private java.time.LocalDate checkOutDate;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @PostLoad
    protected void onLoad() {
        // Recalculate totalAmount if it's 0 (for old bookings)
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) == 0) {
            recalculateTotalAmount();
        }
    }

    private void recalculateTotalAmount() {
        BigDecimal total = BigDecimal.ZERO;
        
        // Calculate room charges (room price * number of nights)
        if (checkInDate != null && checkOutDate != null && rooms != null) {
            long nights = java.time.temporal.ChronoUnit.DAYS.between(checkInDate, checkOutDate);
            if (nights <= 0) nights = 1;
            for (Room room : rooms) {
                if (room != null && room.getPricePerNight() != null) {
                    total = total.add(room.getPricePerNight().multiply(BigDecimal.valueOf(nights)));
                }
            }
        }
        
        // Calculate food charges
        if (foodItems != null) {
            java.util.Map<Long, Integer> quantities = new java.util.HashMap<>();
            if (foodQuantities != null && !foodQuantities.isEmpty()) {
                try {
                    // Parse JSON quantities if present
                    var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    quantities = mapper.readValue(foodQuantities, 
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<Long, Integer>>() {});
                } catch (Exception e) {
                    // Fallback to 1 for each item if parsing fails
                }
            }
            
            for (FoodItem food : foodItems) {
                if (food != null && food.getPrice() != null) {
                    int qty = quantities.getOrDefault(food.getId(), 1);
                    total = total.add(food.getPrice().multiply(BigDecimal.valueOf(qty)));
                }
            }
        }
        
        this.totalAmount = total;
    }

    public Booking() {}

    public Booking(Long id, User user, List<Room> rooms, List<FoodItem> foodItems, String foodQuantities,
                   BigDecimal totalAmount, BookingStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.rooms = rooms;
        this.foodItems = foodItems;
        this.foodQuantities = foodQuantities;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<Room> getRooms() { return rooms; }
    public void setRooms(List<Room> rooms) { this.rooms = rooms; }
    public List<FoodItem> getFoodItems() { return foodItems; }
    public void setFoodItems(List<FoodItem> foodItems) { this.foodItems = foodItems; }
    public String getFoodQuantities() { return foodQuantities; }
    public void setFoodQuantities(String foodQuantities) { this.foodQuantities = foodQuantities; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public java.time.LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(java.time.LocalDate checkInDate) { this.checkInDate = checkInDate; }
    public java.time.LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(java.time.LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
}
