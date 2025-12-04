package com.shrey.hotel.config;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.shrey.hotel.model.FoodItem;
import com.shrey.hotel.model.Role;
import com.shrey.hotel.model.Room;
import com.shrey.hotel.model.User;
import com.shrey.hotel.repository.FoodItemRepository;
import com.shrey.hotel.repository.RoomRepository;
import com.shrey.hotel.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {
    private final RoomRepository roomRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(RoomRepository roomRepository, 
                          FoodItemRepository foodItemRepository,
                          UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.foodItemRepository = foodItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // Seed rooms if database is empty
        if (roomRepository.count() == 0) {
            seedRooms();
        }
        
        // Seed food items if database is empty
        if (foodItemRepository.count() == 0) {
            seedFoodItems();
        }
        
        // Create or update default admin user
        User admin = userRepository.findByEmail("admin@hotel.com").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setEmail("admin@hotel.com");
            admin.setFullName("Admin User");
            System.out.println("✅ Creating default admin user: admin@hotel.com");
        } else {
            System.out.println("✅ Updating default admin user: admin@hotel.com");
        }
        admin.setPasswordHash(passwordEncoder.encode("admin12345"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        System.out.println("✅ Admin user password set to: admin12345");
        
        System.out.println("✅ Data initialization complete!");
        System.out.println("📊 Rooms: " + roomRepository.count());
        System.out.println("🍽️ Food Items: " + foodItemRepository.count());
        System.out.println("👤 Users: " + userRepository.count());
    }

    private void seedRooms() {
        // 15 Standard Rooms (101-115)
        for (int i = 101; i <= 115; i++) {
            Room room = new Room();
            room.setRoomNumber(i);
            room.setRoomType("Standard Room");
            room.setPricePerNight(new BigDecimal("1500"));
            room.setAvailable(true);
            roomRepository.save(room);
        }

        // 5 Deluxe Rooms (201-205)
        for (int i = 201; i <= 205; i++) {
            Room room = new Room();
            room.setRoomNumber(i);
            room.setRoomType("Deluxe Room");
            room.setPricePerNight(new BigDecimal("2000"));
            room.setAvailable(true);
            roomRepository.save(room);
        }

        // 1 Suite (301)
        Room suite = new Room();
        suite.setRoomNumber(301);
        suite.setRoomType("Suite");
        suite.setPricePerNight(new BigDecimal("5000"));
        suite.setAvailable(true);
        roomRepository.save(suite);

        System.out.println("✅ Seeded 21 rooms (15 Standard, 5 Deluxe, 1 Suite)");
    }

    private void seedFoodItems() {
        // Indian Cuisine
        saveFoodItem("Butter Chicken", "Indian", "250");
        saveFoodItem("Masala Dosa", "Indian", "180");

        // Italian Cuisine
        saveFoodItem("Margherita Pizza", "Italian", "300");
        saveFoodItem("Pasta Carbonara", "Italian", "280");

        // Japanese Cuisine
        saveFoodItem("Sushi Rolls", "Japanese", "350");
        saveFoodItem("Ramen Noodles", "Japanese", "220");

        // Thai Cuisine
        saveFoodItem("Pad Thai", "Thai", "280");
        saveFoodItem("Green Curry", "Thai", "320");

        // Chinese Cuisine
        saveFoodItem("Kung Pao Chicken", "Chinese", "240");
        saveFoodItem("Chow Mein", "Chinese", "200");

        // Middle Eastern Cuisine
        saveFoodItem("Chicken Tikka", "Middle Eastern", "220");
        saveFoodItem("Falafel Wrap", "Middle Eastern", "180");

        // American Cuisine
        saveFoodItem("Cheeseburger", "American", "200");
        saveFoodItem("Caesar Salad", "American", "180");

        // Norwegian Cuisine
        saveFoodItem("Grilled Salmon", "Norwegian", "400");
        saveFoodItem("Fish Soup", "Norwegian", "280");

        System.out.println("✅ Seeded 16 food items across 8 cuisines");
    }

    private void saveFoodItem(String name, String cuisine, String price) {
        FoodItem item = new FoodItem();
        item.setName(name);
        item.setCuisine(cuisine);
        item.setPrice(new BigDecimal(price));
        foodItemRepository.save(item);
    }
}
