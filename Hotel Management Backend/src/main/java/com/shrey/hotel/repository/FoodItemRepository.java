package com.shrey.hotel.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shrey.hotel.model.FoodItem;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByCuisine(String cuisine);
    Page<FoodItem> findByCuisine(String cuisine, Pageable pageable);
    Page<FoodItem> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    Page<FoodItem> findByCuisineAndPriceBetween(String cuisine, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    Page<FoodItem> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
