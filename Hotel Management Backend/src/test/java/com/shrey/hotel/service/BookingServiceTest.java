package com.shrey.hotel.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.shrey.hotel.BaseIntegrationTest;
import com.shrey.hotel.model.Room;
import com.shrey.hotel.repository.RoomRepository;

public class BookingServiceTest extends BaseIntegrationTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private RoomRepository roomRepository;

    @Test
    void bookRoom_preventsDoubleBooking_and_releaseRestoresAvailability() {
        // find an available room
        Optional<Room> firstAvailable = bookingService.findFirstAvailable();
        assertTrue(firstAvailable.isPresent(), "There should be at least one available room");
        Integer roomNumber = firstAvailable.get().getRoomNumber();

        // book succeeds first time
        boolean booked = bookingService.bookRoom(roomNumber);
        assertTrue(booked, "Booking should succeed for available room");

        // booking same room again fails
        boolean bookedAgain = bookingService.bookRoom(roomNumber);
        assertFalse(bookedAgain, "Booking should fail for already booked room");

        // release room
        bookingService.releaseRoom(roomNumber);

        // now it should be available
        Room room = roomRepository.findByRoomNumber(roomNumber).orElseThrow();
        assertTrue(room.getAvailable(), "Room should be available after release");
    }
}
