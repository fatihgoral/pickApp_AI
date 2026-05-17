package com.aliyilmaz.entities;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "kategori")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Kategori {

	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "restoran_id", nullable = false)
	@JsonIgnore
	private Restoran restoran;

	@Column(name = "kategori_adi", nullable = false, length = 120)
	private String kategoriAdi;

	@Column(name = "sira_no", nullable = false)
	private Integer siraNo;

	@OneToMany(mappedBy = "kategori", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Urun> urunler = new ArrayList<>();
}
