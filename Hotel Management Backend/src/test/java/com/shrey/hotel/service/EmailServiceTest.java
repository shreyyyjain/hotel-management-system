package com.shrey.hotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.shrey.hotel.model.Booking;
import com.shrey.hotel.model.BookingStatus;
import com.shrey.hotel.model.Room;
import com.shrey.hotel.model.User;

@SuppressWarnings({"null"})
public class EmailServiceTest {

    @Test
    void sendBookingConfirmation_buildsMessage() {
        JavaMailSender sender = mock(JavaMailSender.class);
        EmailService svc = new EmailService(sender);
        // manually set fromAddress default via reflection since @Value not processed
        try {
            var f = EmailService.class.getDeclaredField("fromAddress");
            f.setAccessible(true);
            f.set(svc, "noreply@test.local");
        } catch (NoSuchFieldException | IllegalAccessException e) {
            Assertions.fail("Failed to set fromAddress for test: " + e.getMessage());
        }

        User user = new User();
        user.setEmail("user@example.com");
        user.setFullName("Test User");
        Booking booking = new Booking();
        booking.setId(42L);
        booking.setUser(user);
        booking.setRooms(List.of(createRoom(101), createRoom(102)));
        booking.setTotalAmount(BigDecimal.valueOf(250));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setCreatedAt(LocalDateTime.now());

        svc.sendBookingConfirmation(booking);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender, times(1)).send(captor.capture());
        SimpleMailMessage msg = captor.getValue();
        String[] to = Objects.requireNonNull(msg.getTo(), "Recipients array should not be null");
        Assertions.assertTrue(to.length > 0, "Recipients array should not be empty");
        Assertions.assertEquals("user@example.com", to[0]);
        String subject = Objects.requireNonNull(msg.getSubject());
        Assertions.assertTrue(subject.startsWith("Booking Confirmation - 42"));
        String text = Objects.requireNonNull(msg.getText());
        Assertions.assertTrue(text.contains("Rooms (2)"));
        Assertions.assertTrue(text.contains("Total: 250"));
    }

    private Room createRoom(int number) {
        Room r = new Room();
        r.setRoomNumber(number);
        r.setAvailable(true);
        return r;
    }
}
