package com.shrey.hotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.shrey.hotel.BaseIntegrationTest;
import com.shrey.hotel.model.FoodItem;
import com.shrey.hotel.model.Room;
import com.shrey.hotel.repository.FoodItemRepository;
import com.shrey.hotel.repository.RoomRepository;

public class CartValidationTest extends BaseIntegrationTest {

    @Autowired
    private CartService cartService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Test
    void addFood_negativeQuantity_throws() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> cartService.addFoodToCart("s", 1L, -1));
        assertTrue(ex.getMessage().toLowerCase().contains("quantity"));
    }

    @Test
    void addFood_largeQuantity_getsCapped() {
        var cart = cartService.addFoodToCart("s", 1L, 999);
        assertEquals(20, cart.getFoodItems().get(1L));
    }

    @Test
    void cart_exceedingTenItems_throws() {
        String sessionId = "limit-test-" + System.currentTimeMillis();
        // Get 11 distinct rooms
        var allRooms = roomRepository.findAll().stream().limit(11).toList();
        assertTrue(allRooms.size() >= 11, "Need at least 11 rooms in test DB");
        
        // Add first 10 rooms
        for (int i = 0; i < 10; i++) {
            cartService.addRoomToCart(sessionId, allRooms.get(i).getId());
        }
        
        var cart = cartService.getCart(sessionId);
        assertEquals(10, cart.getRoomIds().size(), "Should have 10 rooms in cart");
        
        // Attempt to add 11th distinct room
        Room eleventhRoom = allRooms.get(10);
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> cartService.addRoomToCart(sessionId, eleventhRoom.getId()));
        assertTrue(ex.getMessage().toLowerCase().contains("cart"));
    }

    @Test
    void cart_mixedItems_respectsTenItemLimit() {
        String sessionId = "mixed-limit-" + System.currentTimeMillis();
        var rooms = roomRepository.findAll().stream().limit(5).toList();
        var allFoods = foodItemRepository.findAll().stream().limit(6).toList();
        assertTrue(allFoods.size() >= 6, "Need at least 6 food items");
        
        for (Room room : rooms) {
            cartService.addRoomToCart(sessionId, room.getId());
        }
        // Add first 5 foods (total = 10 items)
        for (int i = 0; i < 5; i++) {
            cartService.addFoodToCart(sessionId, allFoods.get(i).getId(), 1);
        }
        
        // Try to add 11th item (6th food)
        FoodItem sixthFood = allFoods.get(5);
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> cartService.addFoodToCart(sessionId, sixthFood.getId(), 1));
        assertTrue(ex.getMessage().toLowerCase().contains("cart"));
    }
}
