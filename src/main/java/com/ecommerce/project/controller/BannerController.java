package com.ecommerce.project.controller;

import com.ecommerce.project.model.Banner;
import com.ecommerce.project.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * BannerController — Dynamic Banner CMS Engine
 *
 * Public:
 *   GET /api/banners/active   — Returns all active banners sorted by displayOrder
 *
 * Admin (JWT + ROLE_ADMIN):
 *   GET    /api/admin/banners         — All banners (including inactive)
 *   POST   /api/admin/banners         — Create a new banner
 *   PUT    /api/admin/banners/{id}    — Update a banner
 *   DELETE /api/admin/banners/{id}    — Delete a banner
 */
@RestController
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    // ─── PUBLIC ENDPOINT ────────────────────────────────────────────────────────

    @GetMapping("/api/banners/active")
    public ResponseEntity<List<Banner>> getActiveBanners() {
        return ResponseEntity.ok(bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
    }

    // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

    @GetMapping("/api/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerRepository.findAll());
    }

    @PostMapping("/api/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createBanner(@RequestBody Banner banner) {
        if (banner.getImageUrl() == null || banner.getImageUrl().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "imageUrl is required"));
        }
        if (banner.getSlideSpeedMs() == null || banner.getSlideSpeedMs() < 1000) {
            banner.setSlideSpeedMs(4000);
        }
        if (banner.getDisplayOrder() == null) {
            banner.setDisplayOrder(0);
        }
        if (banner.getIsActive() == null) {
            banner.setIsActive(true);
        }
        Banner saved = bannerRepository.save(banner);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/api/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @RequestBody Banner payload) {
        Optional<Banner> opt = bannerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Banner banner = opt.get();
        if (payload.getImageUrl() != null && !payload.getImageUrl().isBlank()) {
            banner.setImageUrl(payload.getImageUrl());
        }
        if (payload.getRedirectUrl() != null) {
            banner.setRedirectUrl(payload.getRedirectUrl());
        }
        if (payload.getDisplayOrder() != null) {
            banner.setDisplayOrder(payload.getDisplayOrder());
        }
        if (payload.getSlideSpeedMs() != null && payload.getSlideSpeedMs() >= 1000) {
            banner.setSlideSpeedMs(payload.getSlideSpeedMs());
        }
        if (payload.getIsActive() != null) {
            banner.setIsActive(payload.getIsActive());
        }
        if (payload.getTitle() != null) {
            banner.setTitle(payload.getTitle());
        }
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @DeleteMapping("/api/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        if (!bannerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bannerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Banner deleted successfully"));
    }
}
