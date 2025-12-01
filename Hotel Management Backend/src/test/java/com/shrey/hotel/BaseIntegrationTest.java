package com.shrey.hotel;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.shrey.hotel.model.FoodItem;
import com.shrey.hotel.model.Room;
import com.shrey.hotel.repository.FoodItemRepository;
import com.shrey.hotel.repository.RoomRepository;

import jakarta.annotation.PostConstruct;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {
    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @PostConstruct
    public void initTestData() {
        if (roomRepository.count() == 0) {
            for (int i = 1; i <= 15; i++) {
                Room room = new Room();
                room.setRoomNumber(100 + i);
                room.setRoomType(i % 2 == 0 ? "DELUXE" : "STANDARD");
                room.setPricePerNight(BigDecimal.valueOf(100 * i));
                room.setAvailable(true);
                roomRepository.save(room);
            }
        }
        if (foodItemRepository.count() == 0) {
            for (int i = 1; i <= 15; i++) {
                FoodItem food = new FoodItem();
                food.setName("Food Item " + i);
                food.setCuisine(i % 3 == 0 ? "Indian" : (i % 3 == 1 ? "Chinese" : "Continental"));
                food.setPrice(BigDecimal.valueOf(10 * i));
                food.setImageUrl("http://example.com/food" + i + ".jpg");
                foodItemRepository.save(food);
            }
        }
    }
}
