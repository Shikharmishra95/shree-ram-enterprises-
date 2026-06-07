package com.ecommerce.project.controller;

import com.ecommerce.project.exception.ResourceNotFoundException;
import com.ecommerce.project.model.Address;
import com.ecommerce.project.model.User;
import com.ecommerce.project.repository.AddressRepository;
import com.ecommerce.project.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    /**
     * GET /api/users/profile
     * Fetch active session user metadata.
     */
    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return ResponseEntity.ok(user);
    }

    /**
     * PUT /api/users/profile
     * Update active session user metadata (email, phone number).
     */
    @PutMapping("/profile")
    public ResponseEntity<User> updateUserProfile(
            @RequestBody Map<String, String> payload, 
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        String email = payload.get("email");
        String phoneNumber = payload.get("phoneNumber");

        if (email != null && !email.trim().isEmpty()) {
            user.setEmail(email.trim());
        }
        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber.trim());
        }

        User updated = userRepository.save(user);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/users/addresses
     * Retrieve address book for the authenticated customer.
     */
    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> getAddresses(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return ResponseEntity.ok(addressRepository.findByUser(user));
    }

    /**
     * POST /api/users/addresses
     * Add a new address to the user's address book.
     */
    @PostMapping("/addresses")
    public ResponseEntity<Address> addAddress(
            @Valid @RequestBody Address address, 
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        address.setUser(user);
        Address saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /api/users/addresses/{addressId}
     * Update an existing address.
     */
    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody Address updatedAddress,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Address existing = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!existing.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        existing.setStreet(updatedAddress.getStreet());
        existing.setCity(updatedAddress.getCity());
        existing.setState(updatedAddress.getState());
        existing.setZipCode(updatedAddress.getZipCode());
        existing.setCountry(updatedAddress.getCountry());
        existing.setName(updatedAddress.getName());
        existing.setPhoneNumber(updatedAddress.getPhoneNumber());

        Address saved = addressRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/users/addresses/{addressId}
     * Delete an address from the user's address book.
     */
    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long addressId,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Address existing = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!existing.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        addressRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
