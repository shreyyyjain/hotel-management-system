package com.shrey.hotel.controller;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shrey.hotel.model.Booking;
import com.shrey.hotel.model.BookingStatus;
import com.shrey.hotel.repository.BookingRepository;
import com.shrey.hotel.repository.UserRepository;
import com.shrey.hotel.service.EmailService;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public BookingController(BookingRepository bookingRepository,
                             UserRepository userRepository,
                             Optional<EmailService> emailService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.emailService = emailService.orElse(null); // optional in @WebMvcTest slices
    }

    @GetMapping("/my-history")
    public ResponseEntity<Page<Booking>> getMyBookings(
            Principal principal,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        if (status != null) {
            return ResponseEntity.ok(bookingRepository.findByUserAndStatus(user, status, pageable));
        }
        return ResponseEntity.ok(bookingRepository.findByUser(user, pageable));
    }

    @GetMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Booking> getBooking(@PathVariable Long id, Principal principal) {
        return bookingRepository.findById(id)
                .filter(booking -> booking.getUser().getEmail().equals(principal.getName()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    @SuppressWarnings("null")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        
        var bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Booking booking = bookingOpt.get();
        if (!booking.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        
        String newStatus = body.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }
        
        try {
            BookingStatus status = BookingStatus.valueOf(newStatus.toUpperCase());
            // Only allow user to cancel their own bookings
            if (status == BookingStatus.CANCELLED) {
                booking.setStatus(status);
                bookingRepository.save(booking);
                if (emailService != null) {
                    try {
                        String to = booking.getUser().getEmail();
                        String details = "Rooms: " + (booking.getRooms() == null ? 0 : booking.getRooms().size()) +
                                ", Total: " + booking.getTotalAmount();
                        emailService.sendBookingCancellation(to, String.valueOf(booking.getId()), details);
                    } catch (Exception ignored) {}
                }
                return ResponseEntity.ok(Map.of("success", true, "message", "Booking cancelled"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Can only cancel bookings"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
        }
    }

    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id, Principal principal) {
        var bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Booking booking = bookingOpt.get();
        if (!booking.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        
        // Soft delete by setting status to CANCELLED
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        
        if (emailService != null) {
            try {
                String to = booking.getUser().getEmail();
                String details = "Rooms: " + (booking.getRooms() == null ? 0 : booking.getRooms().size()) +
                        ", Total: " + booking.getTotalAmount();
                emailService.sendBookingCancellation(to, String.valueOf(booking.getId()), details);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Booking deleted"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Booking>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(bookingRepository.findAll(pageable));
    }
}
