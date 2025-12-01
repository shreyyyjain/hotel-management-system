package com.shrey.hotel.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shrey.hotel.model.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(Integer roomNumber);
    List<Room> findByRoomType(String roomType);
    Page<Room> findByRoomType(String roomType, Pageable pageable);
    List<Room> findByAvailableTrue();
    Page<Room> findByAvailableTrue(Pageable pageable);
    Optional<Room> findFirstByAvailableTrue();
    Page<Room> findByPricePerNightBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    Page<Room> findByRoomTypeAndPricePerNightBetween(String roomType, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
}
