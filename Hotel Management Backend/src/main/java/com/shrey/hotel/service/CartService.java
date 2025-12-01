package com.shrey.hotel.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.shrey.hotel.dto.CartDTO;
import com.shrey.hotel.repository.FoodItemRepository;
import com.shrey.hotel.repository.RoomRepository;

@Service
public class CartService {
    private final RoomRepository roomRepository;
    private final FoodItemRepository foodItemRepository;
    
    // In-memory cart storage (per-session, would use Redis/DB in production)
    private final Map<String, CartDTO> carts = new HashMap<>();

    public CartService(RoomRepository roomRepository, FoodItemRepository foodItemRepository) {
        this.roomRepository = roomRepository;
        this.foodItemRepository = foodItemRepository;
    }

    public CartDTO getCart(String sessionId) {
        return carts.getOrDefault(sessionId, new CartDTO());
    }

    public CartDTO addRoomToCart(String sessionId, Long roomId) {
        CartDTO cart = getCart(sessionId);
        // Count unique items: each room counts as 1, each food type counts as 1
        int totalUniqueItems = cart.getRoomIds().size() + cart.getFoodItems().keySet().size();
        if (totalUniqueItems >= 10 && !cart.getRoomIds().contains(roomId)) {
            throw new IllegalStateException("Cart cannot exceed 10 unique items");
        }
        if (!cart.getRoomIds().contains(roomId)) {
            cart.getRoomIds().add(roomId);
        }
        recalculateTotal(cart);
        carts.put(sessionId, cart);
        return cart;
    }

    public CartDTO addFoodToCart(String sessionId, Long foodItemId, int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity must be non-negative");
        }
        if (quantity > 20) {
            quantity = 20; // simple cap to prevent unrealistic orders
        }
        CartDTO cart = getCart(sessionId);
        // Count unique items: each room counts as 1, each food type counts as 1
        int totalUniqueItems = cart.getRoomIds().size() + cart.getFoodItems().keySet().size();
        if (totalUniqueItems >= 10 && !cart.getFoodItems().containsKey(foodItemId)) {
            throw new IllegalStateException("Cart cannot exceed 10 unique items");
        }
        cart.getFoodItems().put(foodItemId, quantity);
        recalculateTotal(cart);
        carts.put(sessionId, cart);
        return cart;
    }

    public CartDTO removeRoomFromCart(String sessionId, Long roomId) {
        CartDTO cart = getCart(sessionId);
        cart.getRoomIds().remove(roomId);
        recalculateTotal(cart);
        carts.put(sessionId, cart);
        return cart;
    }

    public CartDTO removeFoodFromCart(String sessionId, Long foodItemId) {
        CartDTO cart = getCart(sessionId);
        cart.getFoodItems().remove(foodItemId);
        recalculateTotal(cart);
        carts.put(sessionId, cart);
        return cart;
    }

    public void clearCart(String sessionId) {
        carts.remove(sessionId);
    }

    private void recalculateTotal(CartDTO cart) {
        BigDecimal total = BigDecimal.ZERO;
        // Rooms
        for (Long roomId : cart.getRoomIds()) {
            if (roomId == null) continue;
            BigDecimal roomPrice = roomRepository.findById(roomId)
                    .map(r -> r.getPricePerNight())
                    .orElse(BigDecimal.ZERO);
            total = total.add(roomPrice);
        }
        // Food items
        for (Map.Entry<Long, Integer> entry : cart.getFoodItems().entrySet()) {
            Long foodId = entry.getKey();
            if (foodId == null) continue;
            Integer qtyObj = entry.getValue();
            int qty = qtyObj != null ? qtyObj : 0;
            BigDecimal foodTotal = foodItemRepository.findById(foodId)
                    .map(f -> f.getPrice().multiply(BigDecimal.valueOf(qty)))
                    .orElse(BigDecimal.ZERO);
            total = total.add(foodTotal);
        }
        cart.setTotalAmount(total);
    }
}
