package com.shrey.hotel.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shrey.hotel.model.Booking;
import com.shrey.hotel.model.BookingStatus;
import com.shrey.hotel.model.FoodItem;
import com.shrey.hotel.model.Room;
import com.shrey.hotel.model.User;
import com.shrey.hotel.repository.BookingRepository;
import com.shrey.hotel.repository.FoodItemRepository;
import com.shrey.hotel.repository.RoomRepository;
import com.shrey.hotel.repository.UserRepository;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@PreAuthorize("hasRole('ADMIN')")
@SuppressWarnings("null")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Get all rooms with full details
    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomRepository.findAll());
    }

    // Get all food items
    @GetMapping("/food-items")
    public ResponseEntity<List<FoodItem>> getAllFoodItems() {
        return ResponseEntity.ok(foodItemRepository.findAll());
    }

    // Get all bookings with full details
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        // Initialize lazy-loaded collections to avoid serialization issues
        bookings.forEach(booking -> {
            booking.getUser().getEmail(); // Initialize user
            booking.getRooms().size(); // Initialize rooms
            booking.getFoodItems().size(); // Initialize food items
        });
        return ResponseEntity.ok(bookings);
    }

    // Get comprehensive database statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // User stats
        stats.put("totalUsers", userRepository.count());
        
        // Room stats
        stats.put("totalRooms", roomRepository.count());
        List<Room> allRooms = roomRepository.findAll();
        long availableRooms = allRooms.stream().filter(room -> room.getAvailable()).count();
        stats.put("availableRooms", availableRooms);
        stats.put("bookedRooms", allRooms.size() - availableRooms);
        
        // Food stats
        stats.put("totalFoodItems", foodItemRepository.count());
        
        // Booking stats
        List<Booking> allBookings = bookingRepository.findAll();
        stats.put("totalBookings", allBookings.size());
        
        long pendingBookings = allBookings.stream()
            .filter(b -> BookingStatus.PENDING.equals(b.getStatus()))
            .count();
        long confirmedBookings = allBookings.stream()
            .filter(b -> BookingStatus.CONFIRMED.equals(b.getStatus()))
            .count();
        long cancelledBookings = allBookings.stream()
            .filter(b -> BookingStatus.CANCELLED.equals(b.getStatus()))
            .count();
        long completedBookings = allBookings.stream()
            .filter(b -> BookingStatus.COMPLETED.equals(b.getStatus()))
            .count();
            
        stats.put("pendingBookings", pendingBookings);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("cancelledBookings", cancelledBookings);
        stats.put("completedBookings", completedBookings);
        
        // Revenue stats
        double totalRevenue = allBookings.stream()
            .mapToDouble(booking -> booking.getTotalAmount().doubleValue())
            .sum();
        stats.put("totalRevenue", totalRevenue);
        
        return ResponseEntity.ok(stats);
    }

    // Update room availability
    @PutMapping("/rooms/{id}/availability")
    public ResponseEntity<Room> updateRoomAvailability(
            @PathVariable Long id, 
            @RequestParam boolean available) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setAvailable(available);
        return ResponseEntity.ok(roomRepository.save(room));
    }

    // Update room details
    @PutMapping("/rooms/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Room not found"));
        
        room.setRoomNumber(roomDetails.getRoomNumber());
        room.setRoomType(roomDetails.getRoomType());
        room.setPricePerNight(roomDetails.getPricePerNight());
        room.setAvailable(roomDetails.getAvailable());
        
        return ResponseEntity.ok(roomRepository.save(room));
    }

    // Delete room
    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Update food item
    @PutMapping("/food-items/{id}")
    public ResponseEntity<FoodItem> updateFoodItem(@PathVariable Long id, @RequestBody FoodItem foodDetails) {
        FoodItem foodItem = foodItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Food item not found"));
        
        foodItem.setName(foodDetails.getName());
        foodItem.setCuisine(foodDetails.getCuisine());
        foodItem.setPrice(foodDetails.getPrice());
        
        return ResponseEntity.ok(foodItemRepository.save(foodItem));
    }

    // Delete food item
    @DeleteMapping("/food-items/{id}")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long id) {
        foodItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Create new food item
    @PostMapping("/food-items")
    public ResponseEntity<FoodItem> createFoodItem(@RequestBody FoodItem foodItem) {
        FoodItem savedItem = foodItemRepository.save(foodItem);
        return ResponseEntity.ok(savedItem);
    }

    // Update room price (dedicated endpoint for price updates)
    @PutMapping("/rooms/{id}/price")
    public ResponseEntity<Map<String, Object>> updateRoomPrice(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> priceData) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Room not found"));
        
        if (priceData.containsKey("pricePerNight")) {
            Object priceObj = priceData.get("pricePerNight");
            if (priceObj instanceof Number number) {
                room.setPricePerNight(new java.math.BigDecimal(number.doubleValue()));
            } else {
                room.setPricePerNight(new java.math.BigDecimal(priceObj.toString()));
            }
            roomRepository.save(room);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", room.getId());
        response.put("roomNumber", room.getRoomNumber());
        response.put("pricePerNight", room.getPricePerNight());
        response.put("message", "Price updated successfully");
        return ResponseEntity.ok(response);
    }

    // Update booking status (admin override)
    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id, 
            @RequestParam String status) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    // Delete booking
    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Delete user (with all their bookings)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        // Note: This will cascade delete all user's bookings due to JPA relationships
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Get user details with booking history
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserDetails(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Booking> userBookings = bookingRepository.findByUser(user, org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        Map<String, Object> details = new HashMap<>();
        details.put("user", user);
        details.put("bookings", userBookings);
        details.put("totalBookings", userBookings.size());
        
        double totalSpent = userBookings.stream()
            .mapToDouble(booking -> booking.getTotalAmount().doubleValue())
            .sum();
        details.put("totalSpent", totalSpent);
        
        return ResponseEntity.ok(details);
    }
}
