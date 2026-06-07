package com.ecommerce.project.repository;

import com.ecommerce.project.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    // Fetch only active banners, sorted by display order
    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc();
}
