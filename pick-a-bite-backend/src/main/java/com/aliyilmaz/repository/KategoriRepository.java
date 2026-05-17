package com.aliyilmaz.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aliyilmaz.entities.Kategori;

public interface KategoriRepository extends JpaRepository<Kategori, Integer> {

	List<Kategori> findByRestoranIdOrderBySiraNoAsc(Integer restoranId);
}
