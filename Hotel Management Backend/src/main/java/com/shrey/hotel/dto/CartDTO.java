package com.shrey.hotel.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CartDTO {
    private List<Long> roomIds = new ArrayList<>();
    private Map<Long, Integer> foodItems = new HashMap<>(); // foodItemId -> quantity
    private BigDecimal totalAmount = BigDecimal.ZERO;

    public CartDTO() {}

    public CartDTO(List<Long> roomIds, Map<Long, Integer> foodItems, BigDecimal totalAmount) {
        this.roomIds = roomIds;
        this.foodItems = foodItems;
        this.totalAmount = totalAmount;
    }

    public List<Long> getRoomIds() { return roomIds; }
    public void setRoomIds(List<Long> roomIds) { this.roomIds = roomIds; }
    public Map<Long, Integer> getFoodItems() { return foodItems; }
    public void setFoodItems(Map<Long, Integer> foodItems) { this.foodItems = foodItems; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}
