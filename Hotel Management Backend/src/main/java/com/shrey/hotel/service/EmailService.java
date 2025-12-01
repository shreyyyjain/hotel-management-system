package com.shrey.hotel.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.shrey.hotel.model.Booking;
import com.shrey.hotel.model.FoodItem;
import com.shrey.hotel.model.Room;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@hotel.local}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendBookingConfirmation(String to, String bookingId, String details) {
        String subject = "Booking Confirmation - " + bookingId;
        String text = "Your booking is confirmed.\n\n" + details;
        send(to, subject, text);
    }

    /**
     * Convenience overload to build details automatically from a Booking domain object.
     */
    public void sendBookingConfirmation(Booking booking) {
        if (booking == null || booking.getUser() == null) return;
        String to = booking.getUser().getEmail();
        String bookingId = booking.getId() == null ? "(pending id)" : String.valueOf(booking.getId());
        String details = buildDetails(booking);
        sendBookingConfirmation(to, bookingId, details);
    }

    public void sendBookingCancellation(String to, String bookingId, String details) {
        String subject = "Booking Cancelled - " + bookingId;
        String text = "Your booking has been cancelled.\n\n" + details;
        send(to, subject, text);
    }

    private String buildDetails(Booking booking) {
        int roomCount = booking.getRooms() == null ? 0 : booking.getRooms().size();
        String roomNumbers = booking.getRooms() == null ? "" : booking.getRooms().stream().map(Room::getRoomNumber).map(String::valueOf).reduce((a,b) -> a + ", " + b).orElse("");
        int foodCount = booking.getFoodItems() == null ? 0 : booking.getFoodItems().size();
        String foodNames = booking.getFoodItems() == null ? "" : booking.getFoodItems().stream().map(FoodItem::getName).reduce((a,b) -> a + ", " + b).orElse("");
        String total = booking.getTotalAmount() == null ? "0" : booking.getTotalAmount().toPlainString();
        return "Rooms (" + roomCount + "): " + roomNumbers + "\n" +
               "Food Items (" + foodCount + "): " + foodNames + "\n" +
               "Total: " + total + "\n" +
               "Status: " + booking.getStatus() + "\n" +
               "Created: " + (booking.getCreatedAt() == null ? "-" : booking.getCreatedAt());
    }

    private void send(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        try {
            mailSender.send(message);
        } catch (org.springframework.mail.MailException ex) {
            // swallow in dev; log in real impl
        }
    }
}
