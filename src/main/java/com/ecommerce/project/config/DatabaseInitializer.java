package com.ecommerce.project.config;

import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.User;
import com.ecommerce.project.repository.ProductRepository;
import com.ecommerce.project.repository.UserRepository;
import com.ecommerce.project.model.Category;
import com.ecommerce.project.repository.CategoryRepository;
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
    private CategoryRepository categoryRepository;

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

        // 3. Seed Default Categories if none exist
        if (categoryRepository.count() == 0) {
            String[][] defaultCategories = {
                {"Hair Care", "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&auto=format&fit=crop&q=80", "1"},
                {"Face Care", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80", "2"},
                {"Shaving", "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80", "3"},
                {"Appliances", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80", "4"},
                {"Salon Tools", "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=300&auto=format&fit=crop&q=80", "5"},
                {"Skin Care", "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&auto=format&fit=crop&q=80", "6"},
                {"Beard Care", "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&auto=format&fit=crop&q=80", "7"},
                {"Salon Essentials", "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&auto=format&fit=crop&q=80", "8"},
                {"Hair Accessories", "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=300&auto=format&fit=crop&q=80", "9"},
                {"Makeup & More", "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&auto=format&fit=crop&q=80", "10"}
            };
            List<Category> catsToSave = new ArrayList<>();
            for (String[] defCat : defaultCategories) {
                catsToSave.add(new Category(defCat[0], defCat[1], true, Integer.parseInt(defCat[2])));
            }
            categoryRepository.saveAll(catsToSave);
            System.out.println("Seeded default main categories");
        }
    }
}
