package com.shrey.hotel.repository;

import com.shrey.hotel.model.Booking;
import com.shrey.hotel.model.BookingStatus;
import com.shrey.hotel.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Page<Booking> findByUser(User user, Pageable pageable);
    Page<Booking> findByUserAndStatus(User user, BookingStatus status, Pageable pageable);
}
