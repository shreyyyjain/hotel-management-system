package com.shrey.hotel.controller;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shrey.hotel.model.Booking;
import com.shrey.hotel.model.BookingStatus;
import com.shrey.hotel.model.FoodItem;
import com.shrey.hotel.model.Room;
import com.shrey.hotel.repository.BookingRepository;
import com.shrey.hotel.repository.FoodItemRepository;
import com.shrey.hotel.repository.RoomRepository;
import com.shrey.hotel.repository.UserRepository;
import com.shrey.hotel.service.EmailService;

@RestController
@RequestMapping("/bookings")
public class BookingCreationController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final FoodItemRepository foodItemRepository;
    private final EmailService emailService; // optional

    public BookingCreationController(BookingRepository bookingRepository,
                                     UserRepository userRepository,
                                     RoomRepository roomRepository,
                                     FoodItemRepository foodItemRepository,
                                     EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.foodItemRepository = foodItemRepository;
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody BookingCreateRequest req, Principal principal) {
        // For now, allow anonymous bookings - in production, enforce authentication
        var user = principal != null 
            ? userRepository.findByEmail(principal.getName()).orElse(null)
            : userRepository.findAll().stream().findFirst().orElse(null); // fallback for testing
        if (user == null) return ResponseEntity.status(403).body(Map.of("error","User not found or not authenticated"));
        List<Room> rooms = req.roomIds == null ? List.of() : roomRepository.findAllById(req.roomIds);
        
        // Handle both foodItemIds and foodItems formats
        List<FoodItem> foodItems;
        java.util.Map<Long, Integer> foodQuantitiesMap = new java.util.HashMap<>();
        if (req.foodItems != null && !req.foodItems.isEmpty()) {
            List<Long> ids = req.foodItems.stream()
                .map(f -> f.foodItemId)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());
            foodItems = foodItemRepository.findAllById(new java.util.ArrayList<>(ids));
            // Build food quantities map
            for (FoodItemQuantity fiq : req.foodItems) {
                if (fiq.foodItemId != null && fiq.quantity != null) {
                    foodQuantitiesMap.put(fiq.foodItemId, fiq.quantity);
                }
            }
        } else {
            foodItems = req.foodItemIds == null ? List.of() : foodItemRepository.findAllById(req.foodItemIds);
        }

        // Calculate total amount server-side
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // Calculate room charges (room price * quantity * number of nights)
        if (req.checkInDate != null && req.checkOutDate != null) {
            java.time.LocalDate checkIn = java.time.LocalDate.parse(req.checkInDate);
            java.time.LocalDate checkOut = java.time.LocalDate.parse(req.checkOutDate);
            long nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
            if (nights <= 0) nights = 1;
            
            for (Room room : rooms) {
                BigDecimal roomPrice = room.getPricePerNight() != null ? room.getPricePerNight() : BigDecimal.ZERO;
                totalAmount = totalAmount.add(roomPrice.multiply(BigDecimal.valueOf(nights)));
            }
        }
        
        // Calculate food charges
        for (FoodItem food : foodItems) {
            BigDecimal foodPrice = food.getPrice() != null ? food.getPrice() : BigDecimal.ZERO;
            Integer quantity = foodQuantitiesMap.getOrDefault(food.getId(), 1);
            totalAmount = totalAmount.add(foodPrice.multiply(BigDecimal.valueOf(quantity)));
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRooms(rooms);
        booking.setFoodItems(foodItems);
        booking.setFoodQuantities(req.foodQuantities);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED);
        
        // Set check-in and check-out dates
        if (req.checkInDate != null) {
            booking.setCheckInDate(java.time.LocalDate.parse(req.checkInDate));
        }
        if (req.checkOutDate != null) {
            booking.setCheckOutDate(java.time.LocalDate.parse(req.checkOutDate));
        }

        booking = bookingRepository.save(booking);

        try { if (emailService != null) emailService.sendBookingConfirmation(booking); } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of(
                "id", booking.getId(),
                "status", booking.getStatus(),
                "total", booking.getTotalAmount()
        ));
    }

    public static class BookingCreateRequest {
        public List<Long> roomIds;
        public List<Long> foodItemIds;
        public List<FoodItemQuantity> foodItems; // frontend sends this format
        public String foodQuantities; // raw JSON string
        public BigDecimal totalAmount; // client-provided for now
        public String checkInDate; // ISO date string
        public String checkOutDate; // ISO date string
    }
    
    public static class FoodItemQuantity {
        public Long foodItemId;
        public Integer quantity;
    }
}
