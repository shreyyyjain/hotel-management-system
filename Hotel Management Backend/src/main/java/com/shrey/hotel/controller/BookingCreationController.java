package com.shrey.hotel.controller;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> create(@RequestBody BookingCreateRequest req, Principal principal) {
        var user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(403).body(Map.of("error","User not found"));
        List<Room> rooms = req.roomIds == null ? List.of() : roomRepository.findAllById(req.roomIds);
        List<FoodItem> foodItems = req.foodItemIds == null ? List.of() : foodItemRepository.findAllById(req.foodItemIds);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRooms(rooms);
        booking.setFoodItems(foodItems);
        booking.setFoodQuantities(req.foodQuantities);
        booking.setTotalAmount(req.totalAmount == null ? BigDecimal.ZERO : req.totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED);

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
        public String foodQuantities; // raw JSON string
        public BigDecimal totalAmount; // client-provided for now
    }
}
