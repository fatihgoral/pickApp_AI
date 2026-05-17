package com.aliyilmaz.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aliyilmaz.entities.Urun;

public interface UrunRepository extends JpaRepository<Urun, Integer> {

	List<Urun> findByKategoriIdOrderByUrunAdiAsc(Integer kategoriId);
}
