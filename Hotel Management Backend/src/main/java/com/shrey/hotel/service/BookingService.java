package com.shrey.hotel.service;

import com.shrey.hotel.model.Room;
import com.shrey.hotel.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class BookingService {
    private final RoomRepository roomRepository;

    public BookingService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Optional<Room> findFirstAvailable() {
        return roomRepository.findFirstByAvailableTrue();
    }

    @Transactional
    public synchronized boolean bookRoom(Integer roomNumber) {
        Optional<Room> rOpt = roomRepository.findByRoomNumber(roomNumber);
        if (rOpt.isEmpty()) return false;
        Room r = rOpt.get();
        if (!r.getAvailable()) return false;
        r.setAvailable(false);
        roomRepository.save(r);
        return true;
    }

    @Transactional
    public synchronized void releaseRoom(Integer roomNumber) {
        Optional<Room> rOpt = roomRepository.findByRoomNumber(roomNumber);
        if (rOpt.isPresent()) {
            Room r = rOpt.get();
            r.setAvailable(true);
            roomRepository.save(r);
        }
    }
}
