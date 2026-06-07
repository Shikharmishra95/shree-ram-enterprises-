package com.ecommerce.project.controller;

import com.ecommerce.project.model.Product;
import com.ecommerce.project.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * GET /api/products
     * Publicly accessible. Supports pagination: ?page=0&size=10&sort=price,asc
     */
    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {

        Page<Product> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/{id}
     * Publicly accessible. Returns a single product or 404.
     */
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    /**
     * POST /api/products
     * Restricted to ROLE_ADMIN only.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product saved = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * PUT /api/products/{id}
     * Restricted to ROLE_ADMIN only.
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/products/{id}
     * Restricted to ROLE_ADMIN only.
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/products/{id}/stock
     * Restricted to ROLE_ADMIN only.
     */
    @PatchMapping("/{id:\\d+}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> patchStock(
            @PathVariable Long id, 
            @RequestBody java.util.Map<String, Integer> payload) {
        Integer quantityChange = payload.get("quantityChange");
        if (quantityChange == null) {
            throw new IllegalArgumentException("quantityChange parameter is required");
        }
        Product updated = productService.patchStock(id, quantityChange);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/products/featured
     * Public endpoint. Returns isFeatured=true products sorted by priorityIndex ASC.
     */
    @GetMapping("/featured")
    public ResponseEntity<java.util.List<Product>> getFeaturedProducts() {
        java.util.List<Product> featured = productService.getFeaturedProducts();
        return ResponseEntity.ok(featured);
    }

    /**
     * PATCH /api/products/{id}/feature
     * Admin endpoint. Updates isFeatured and priorityIndex for a product.
     * Body: { "isFeatured": true, "priorityIndex": 1 }
     */
    @PatchMapping("/{id:\\d+}/feature")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateFeatureFlag(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> payload) {
        Product updated = productService.updateFeatureFlag(id, payload);
        return ResponseEntity.ok(updated);
    }
}
