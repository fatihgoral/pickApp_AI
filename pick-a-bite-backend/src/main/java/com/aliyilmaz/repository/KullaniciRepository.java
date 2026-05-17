package com.aliyilmaz.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aliyilmaz.entities.Kullanici;

public interface KullaniciRepository extends JpaRepository<Kullanici, Integer> {

	Optional<Kullanici> findByEmail(String email);

	boolean existsByEmail(String email);
}
