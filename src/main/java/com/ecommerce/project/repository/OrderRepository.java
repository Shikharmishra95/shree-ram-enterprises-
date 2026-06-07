package com.ecommerce.project.repository;

import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByOrderDateDesc(User user);
    // For "Hey Boss" pending count
    long countByStatus(String status);
    List<Order> findByStatusOrderByOrderDateDesc(String status);
}
