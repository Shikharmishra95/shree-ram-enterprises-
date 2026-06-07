package com.ecommerce.project.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "banners")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Image URL is required")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String redirectUrl;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    // Auto-play speed in milliseconds (e.g. 4000 = 4 seconds)
    @Column(nullable = false)
    private Integer slideSpeedMs = 4000;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Size(max = 255)
    @Column(length = 255)
    private String title;

    public Banner() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Integer getSlideSpeedMs() { return slideSpeedMs; }
    public void setSlideSpeedMs(Integer slideSpeedMs) { this.slideSpeedMs = slideSpeedMs; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
