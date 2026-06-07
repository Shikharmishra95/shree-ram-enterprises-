package com.ecommerce.project.controller;

import com.ecommerce.project.model.Category;
import com.ecommerce.project.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * CategoryController — Dynamic CMS Category Management
 *
 * Public:
 *   GET /api/categories/active  — Returns active categories sorted by displayOrder
 *   GET /api/categories         — Returns all categories
 *
 * Admin (JWT + ROLE_ADMIN):
 *   POST   /api/admin/categories         — Create category
 *   PUT    /api/admin/categories/{id}    — Update category (name, image, isActive, order)
 *   DELETE /api/admin/categories/{id}    — Delete category
 */
@RestController
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // ─── PUBLIC ENDPOINTS ───────────────────────────────────────────────────────

    @GetMapping("/api/categories/active")
    public ResponseEntity<List<Category>> getActiveCategories() {
        return ResponseEntity.ok(categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
    }

    @GetMapping("/api/categories")
    public ResponseEntity<List<Category>> getAllCategoriesPublic() {
        return ResponseEntity.ok(categoryRepository.findAllByOrderByDisplayOrderAsc());
    }

    // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

    @PostMapping("/api/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category name is required"));
        }
        if (categoryRepository.existsByName(category.getName().trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category with this name already exists"));
        }
        category.setName(category.getName().trim());
        if (category.getIsActive() == null) category.setIsActive(true);
        if (category.getDisplayOrder() == null) category.setDisplayOrder(0);
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category payload) {
        Optional<Category> opt = categoryRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Category cat = opt.get();
        if (payload.getName() != null && !payload.getName().isBlank()) {
            cat.setName(payload.getName().trim());
        }
        if (payload.getShowcasePhotoUrl() != null) {
            cat.setShowcasePhotoUrl(payload.getShowcasePhotoUrl());
        }
        if (payload.getIsActive() != null) {
            cat.setIsActive(payload.getIsActive());
        }
        if (payload.getDisplayOrder() != null) {
            cat.setDisplayOrder(payload.getDisplayOrder());
        }
        return ResponseEntity.ok(categoryRepository.save(cat));
    }

    @DeleteMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) return ResponseEntity.notFound().build();
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }
}
