package com.shrey.hotel.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shrey.hotel.dto.CartDTO;
import com.shrey.hotel.service.CartService;

@RestController
@RequestMapping("/cart")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDTO> getCart(@RequestHeader(value = "Session-Id", defaultValue = "default") String sessionId) {
        return ResponseEntity.ok(cartService.getCart(sessionId));
    }

    @PostMapping("/rooms")
    public ResponseEntity<CartDTO> addRoom(
            @RequestHeader(value = "Session-Id", defaultValue = "default") String sessionId,
            @RequestBody Map<String, Long> body) {
        Long roomId = body.get("roomId");
        return ResponseEntity.ok(cartService.addRoomToCart(sessionId, roomId));
    }

    @PostMapping("/food")
    public ResponseEntity<CartDTO> addFood(
            @RequestHeader(value = "Session-Id", defaultValue = "default") String sessionId,
            @RequestBody Map<String, Object> body) {
        Long foodItemId = Long.valueOf(body.get("foodItemId").toString());
        Integer quantity = Integer.valueOf(body.get("quantity").toString());
        return ResponseEntity.ok(cartService.addFoodToCart(sessionId, foodItemId, quantity));
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<CartDTO> removeRoom(
            @RequestHeader(value = "Session-Id", defaultValue = "default") String sessionId,
            @PathVariable Long roomId) {
        return ResponseEntity.ok(cartService.removeRoomFromCart(sessionId, roomId));
    }

    @DeleteMapping("/food/{foodItemId}")
    public ResponseEntity<CartDTO> removeFood(
            @RequestHeader(value = "Session-Id", defaultValue = "default") String sessionId,
            @PathVariable Long foodItemId) {
        return ResponseEntity.ok(cartService.removeFoodFromCart(sessionId, foodItemId));
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(@RequestHeader(value = "Session-Id", defaultValue = "default") String sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Cart cleared"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestHeader(value = "Session-Id", defaultValue = "default") String sessionId) {
        CartDTO cart = cartService.getCart(sessionId);
        if (cart.getRoomIds().isEmpty() && cart.getFoodItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Cart is empty"));
        }
        
        // Mock payment processing
        cartService.clearCart(sessionId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment successful",
                "total", cart.getTotalAmount()
        ));
    }
}
