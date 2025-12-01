package com.shrey.hotel.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shrey.hotel.model.Room;
import com.shrey.hotel.repository.RoomRepository;
import com.shrey.hotel.service.BookingService;

@RestController
@RequestMapping("/rooms")
public class RoomController {
    private final RoomRepository roomRepository;
    private final BookingService bookingService;

    public RoomController(RoomRepository roomRepository, BookingService bookingService) {
        this.roomRepository = roomRepository;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<Page<Room>> getAllRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "roomNumber") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(roomRepository.findAll(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Room>> searchRooms(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "roomNumber") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        
        // Simple filtering logic - in production, use Specifications
        if (type != null && minPrice != null && maxPrice != null) {
            return ResponseEntity.ok(roomRepository.findByRoomTypeAndPricePerNightBetween(
                type, minPrice, maxPrice, pageable));
        } else if (type != null) {
            return ResponseEntity.ok(roomRepository.findByRoomType(type, pageable));
        } else if (minPrice != null && maxPrice != null) {
            return ResponseEntity.ok(roomRepository.findByPricePerNightBetween(
                minPrice, maxPrice, pageable));
        } else if (available != null && available) {
            return ResponseEntity.ok(roomRepository.findByAvailableTrue(pageable));
        }
        return ResponseEntity.ok(roomRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable long id) {
        return roomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Room>> getRoomsByType(@PathVariable String type) {
        return ResponseEntity.ok(roomRepository.findByRoomType(type));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Room>> getAvailableRooms() {
        return ResponseEntity.ok(roomRepository.findByAvailableTrue());
    }

    @PostMapping("/{roomNumber}/book")
    public ResponseEntity<?> bookRoom(@PathVariable Integer roomNumber) {
        boolean success = bookingService.bookRoom(roomNumber);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Room booked successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Room not available"));
        }
    }

    @PostMapping("/{roomNumber}/release")
    public ResponseEntity<?> releaseRoom(@PathVariable Integer roomNumber) {
        bookingService.releaseRoom(roomNumber);
        return ResponseEntity.ok(Map.of("success", true, "message", "Room released"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("null")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        Room saved = roomRepository.save(room);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("null")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room room) {
        return roomRepository.findById(id)
                .map(existing -> {
                    existing.setRoomNumber(room.getRoomNumber());
                    existing.setRoomType(room.getRoomType());
                    existing.setPricePerNight(room.getPricePerNight());
                    existing.setAvailable(room.getAvailable());
                    return ResponseEntity.ok(roomRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("null")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        if (!roomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        roomRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Room deleted"));
    }
}
