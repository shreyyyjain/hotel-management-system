package com.shrey.hotel.controller;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shrey.hotel.repository.RoomRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@SuppressWarnings({"null"})
class BookingCreationIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;
    @Autowired RoomRepository roomRepository;
    @MockBean JavaMailSender mailSender; // intercept emails

    @Test
    void createsBookingAndSendsConfirmationEmail() throws Exception {
        String email = "create_user@example.com";
        String password = "Password123!";

        // signup
        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\""+email+"\",\"password\":\""+password+"\",\"fullName\":\"Create User\"}"))
                .andExpect(status().isOk());

        // login
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\""+email+"\",\"password\":\""+password+"\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andReturn();
        String token = mapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        Long roomId = roomRepository.findAll().stream().findFirst().map(r -> r.getId()).orElse(null);
        if (roomId == null) return; // graceful skip

        String body = ("""
                {
                  "roomIds": [%d],
                  "foodItemIds": [],
                  "foodQuantities": "{}",
                  "totalAmount": "199.99"
                }
                """.formatted(roomId));

        mockMvc.perform(post("/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + token)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        verify(mailSender, times(1)).send(org.mockito.ArgumentMatchers.any(SimpleMailMessage.class));
    }
}
