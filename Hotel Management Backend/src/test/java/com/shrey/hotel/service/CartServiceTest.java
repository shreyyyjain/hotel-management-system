package com.shrey.hotel.service;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.shrey.hotel.BaseIntegrationTest;
import com.shrey.hotel.dto.CartDTO;
import com.shrey.hotel.model.FoodItem;
import com.shrey.hotel.model.Room;
import com.shrey.hotel.repository.FoodItemRepository;
import com.shrey.hotel.repository.RoomRepository;

public class CartServiceTest extends BaseIntegrationTest {

    @Autowired
    private CartService cartService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Test
    void cartTotal_calculatesRoomsAndFoodQuantities() {
        String sessionId = "test-session";
        CartDTO cart = cartService.getCart(sessionId);
        assertEquals(BigDecimal.ZERO, cart.getTotalAmount());

        // pick a known room and food item from seeded data
        Room room = roomRepository.findAll().stream().findFirst().orElseThrow();
        FoodItem food = foodItemRepository.findAll().stream().findFirst().orElseThrow();

        // add room
        cartService.addRoomToCart(sessionId, room.getId());
        cart = cartService.getCart(sessionId);
        BigDecimal expectedAfterRoom = room.getPricePerNight();
        assertEquals(expectedAfterRoom, cart.getTotalAmount(), "Total should equal room price");

        // add 3 food items
        cartService.addFoodToCart(sessionId, food.getId(), 3);
        cart = cartService.getCart(sessionId);
        BigDecimal expectedTotal = expectedAfterRoom.add(food.getPrice().multiply(BigDecimal.valueOf(3)));
        assertEquals(expectedTotal, cart.getTotalAmount(), "Total should include food quantity * price");

        // remove room and verify total decreases
        cartService.removeRoomFromCart(sessionId, room.getId());
        cart = cartService.getCart(sessionId);
        BigDecimal expectedAfterRemoveRoom = food.getPrice().multiply(BigDecimal.valueOf(3));
        assertEquals(expectedAfterRemoveRoom, cart.getTotalAmount(), "Total should reflect removal of room");

        // remove food and verify total zero
        cartService.removeFoodFromCart(sessionId, food.getId());
        cart = cartService.getCart(sessionId);
        assertEquals(BigDecimal.ZERO, cart.getTotalAmount(), "Total should be zero after removing items");
    }
}
