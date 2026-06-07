package com.ecommerce.project.repository;

import com.ecommerce.project.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Returns featured products sorted by priority (1 = top priority)
    List<Product> findByIsFeaturedTrueOrderByPriorityIndexAsc();
}
