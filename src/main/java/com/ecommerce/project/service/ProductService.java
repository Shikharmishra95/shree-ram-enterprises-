package com.ecommerce.project.service;

import com.ecommerce.project.exception.ProductNotFoundException;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Retrieve a paginated, sorted list of all products.
     */
    @Transactional(readOnly = true)
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    /**
     * Retrieve a single product by its ID.
     *
     * @throws ProductNotFoundException if the product does not exist.
     */
    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    /**
     * Save a new product to the database.
     */
    @Transactional
    public Product createProduct(Product product) {
        if (product.getPriorityIndex() == null) product.setPriorityIndex(100);
        if (product.getIsFeatured() == null) product.setIsFeatured(false);
        return productRepository.save(product);
    }

    /**
     * Delete a product permanently by its ID.
     */
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    /**
     * Update an existing product's fields.
     */
    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = getProductById(id);
        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setStockQuantity(updatedProduct.getStockQuantity());
        existing.setImageUrl(updatedProduct.getImageUrl());
        existing.setCategory(updatedProduct.getCategory());
        existing.setRating(updatedProduct.getRating());
        existing.setMrp(updatedProduct.getMrp());
        // Preserve CMS fields if provided
        if (updatedProduct.getPriorityIndex() != null) {
            existing.setPriorityIndex(updatedProduct.getPriorityIndex());
        }
        if (updatedProduct.getIsFeatured() != null) {
            existing.setIsFeatured(updatedProduct.getIsFeatured());
        }
        return productRepository.saveAndFlush(existing);
    }

    /**
     * Directly adjust the stock quantity of a product.
     */
    @Transactional
    public Product patchStock(Long id, Integer quantityChange) {
        Product existing = getProductById(id);
        int newStock = existing.getStockQuantity() + quantityChange;
        if (newStock < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative.");
        }
        existing.setStockQuantity(newStock);
        return productRepository.save(existing);
    }

    /**
     * Returns all products marked as featured, sorted by priorityIndex ascending.
     */
    @Transactional(readOnly = true)
    public List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueOrderByPriorityIndexAsc();
    }

    /**
     * Updates isFeatured and/or priorityIndex for a product via the admin CMS.
     */
    @Transactional
    public Product updateFeatureFlag(Long id, Map<String, Object> payload) {
        Product existing = getProductById(id);
        if (payload.containsKey("isFeatured")) {
            existing.setIsFeatured(Boolean.parseBoolean(payload.get("isFeatured").toString()));
        }
        if (payload.containsKey("priorityIndex")) {
            existing.setPriorityIndex(Integer.parseInt(payload.get("priorityIndex").toString()));
        }
        return productRepository.save(existing);
    }
}
