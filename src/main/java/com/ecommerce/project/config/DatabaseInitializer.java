package com.ecommerce.project.config;

import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.User;
import com.ecommerce.project.repository.ProductRepository;
import com.ecommerce.project.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Default Admin and User if none exist
        if (userRepository.count() == 0) {
            User admin = new User(
                    "admin",
                    "admin@shreeramenterprises.com",
                    passwordEncoder.encode("admin123"),
                    "ROLE_ADMIN"
            );
            userRepository.save(admin);

            User testUser = new User(
                    "user",
                    "user@shreeramenterprises.com",
                    passwordEncoder.encode("user123"),
                    "ROLE_USER"
            );
            userRepository.save(testUser);
            System.out.println("Seeded default users: admin/admin123 and user/user123");
        }

        // 2. Seed Products from JSON if database is empty
        if (productRepository.count() == 0) {
            ObjectMapper mapper = new ObjectMapper();
            TypeReference<List<Map<String, Object>>> typeReference = new TypeReference<>() {};
            InputStream inputStream = getClass().getResourceAsStream("/products.json");

            try {
                List<Map<String, Object>> rawProducts = mapper.readValue(inputStream, typeReference);
                List<Product> productsToSave = new ArrayList<>();

                for (Map<String, Object> raw : rawProducts) {
                    String name = (String) raw.get("name");
                    String description = (String) raw.get("description");
                    
                    Object priceObj = raw.get("price");
                    BigDecimal price = BigDecimal.ZERO;
                    if (priceObj instanceof Number) {
                        price = BigDecimal.valueOf(((Number) priceObj).doubleValue());
                    }
                    if (price.compareTo(BigDecimal.ZERO) <= 0) {
                        price = BigDecimal.valueOf(99.00);
                    }

                    // Map categories and subcategories
                    String category = (String) raw.get("category");
                    String subcategory = (String) raw.get("subcategory");
                    if (subcategory != null && !subcategory.trim().isEmpty()) {
                        category = category + " - " + subcategory;
                    }

                    // Map images array to a single URL string
                    String imageUrl = "/product/placeholder.jpg";
                    Object imagesObj = raw.get("images");
                    if (imagesObj instanceof List) {
                        List<?> imagesList = (List<?>) imagesObj;
                        if (!imagesList.isEmpty()) {
                            String firstImg = (String) imagesList.get(0);
                            if (firstImg.startsWith("http")) {
                                imageUrl = firstImg;
                            } else {
                                imageUrl = "/product/" + firstImg;
                            }
                        }
                    }

                    Product product = new Product(
                            name,
                            description,
                            price,
                            100, // Default stock level
                            imageUrl,
                            category,
                            4.5  // Default rating
                    );
                    productsToSave.add(product);
                }

                productRepository.saveAll(productsToSave);
                System.out.println("Seeded " + productsToSave.size() + " products from products.json");
            } catch (Exception e) {
                System.out.println("Unable to seed products: " + e.getMessage());
            }
        }
    }
}
