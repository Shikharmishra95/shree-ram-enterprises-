package com.ecommerce.project.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "cms_categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100, unique = true)
    private String name;

    // Showcase image for the circular avatar on the home screen
    @Column(columnDefinition = "TEXT")
    private String showcasePhotoUrl;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Controls order of display on home screen
    @Column(nullable = false)
    private Integer displayOrder = 0;

    public Category() {}

    public Category(String name, String showcasePhotoUrl, Boolean isActive, Integer displayOrder) {
        this.name = name;
        this.showcasePhotoUrl = showcasePhotoUrl;
        this.isActive = isActive;
        this.displayOrder = displayOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getShowcasePhotoUrl() { return showcasePhotoUrl; }
    public void setShowcasePhotoUrl(String showcasePhotoUrl) { this.showcasePhotoUrl = showcasePhotoUrl; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
