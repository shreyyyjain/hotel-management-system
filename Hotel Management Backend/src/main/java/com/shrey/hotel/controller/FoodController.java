package com.shrey.hotel.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

import com.shrey.hotel.model.FoodItem;
import com.shrey.hotel.repository.FoodItemRepository;

@RestController
@RequestMapping("/food")
public class FoodController {
    private final FoodItemRepository foodItemRepository;

    public FoodController(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    @GetMapping
    public ResponseEntity<Page<FoodItem>> getAllFood(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(foodItemRepository.findAll(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<FoodItem>> searchFood(
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        
        if (cuisine != null && minPrice != null && maxPrice != null) {
            return ResponseEntity.ok(foodItemRepository.findByCuisineAndPriceBetween(
                cuisine, minPrice, maxPrice, pageable));
        } else if (cuisine != null) {
            return ResponseEntity.ok(foodItemRepository.findByCuisine(cuisine, pageable));
        } else if (minPrice != null && maxPrice != null) {
            return ResponseEntity.ok(foodItemRepository.findByPriceBetween(
                minPrice, maxPrice, pageable));
        } else if (name != null) {
            return ResponseEntity.ok(foodItemRepository.findByNameContainingIgnoreCase(
                name, pageable));
        }
        return ResponseEntity.ok(foodItemRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodById(@PathVariable long id) {
        return foodItemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cuisine/{cuisine}")
    public ResponseEntity<List<FoodItem>> getFoodByCuisine(@PathVariable String cuisine) {
        return ResponseEntity.ok(foodItemRepository.findByCuisine(cuisine));
    }

    @GetMapping("/cuisines")
    public ResponseEntity<List<String>> getAllCuisines() {
        List<String> cuisines = foodItemRepository.findAll().stream()
                .map(FoodItem::getCuisine)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return ResponseEntity.ok(cuisines);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("null")
    public ResponseEntity<FoodItem> createFood(@RequestBody FoodItem foodItem) {
        FoodItem saved = foodItemRepository.save(foodItem);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("null")
    public ResponseEntity<FoodItem> updateFood(@PathVariable Long id, @RequestBody FoodItem foodItem) {
        return foodItemRepository.findById(id)
                .map(existing -> {
                    existing.setName(foodItem.getName());
                    existing.setCuisine(foodItem.getCuisine());
                    existing.setPrice(foodItem.getPrice());
                    existing.setImageUrl(foodItem.getImageUrl());
                    return ResponseEntity.ok(foodItemRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("null")
    public ResponseEntity<?> deleteFood(@PathVariable Long id) {
        if (!foodItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        foodItemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Food item deleted"));
    }
}
