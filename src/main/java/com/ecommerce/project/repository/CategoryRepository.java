package com.ecommerce.project.repository;

import com.ecommerce.project.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Fetch only active categories, sorted by display order
    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();
    // Fetch all categories (admin view)
    List<Category> findAllByOrderByDisplayOrderAsc();
    boolean existsByName(String name);
}
