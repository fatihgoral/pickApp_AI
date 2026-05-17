package com.aliyilmaz.entities;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "urun")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Urun {

	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "kategori_id", nullable = false)
	@JsonIgnore
	private Kategori kategori;

	@Column(name = "urun_adi", nullable = false, length = 160)
	private String urunAdi;

	@Column(name = "aciklama", length = 1000)
	private String aciklama;

	@Column(name = "fiyat", nullable = false, precision = 10, scale = 2)
	private BigDecimal fiyat;

	@Column(name = "tahmini_kalori")
	private Integer tahminiKalori;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "urun_alerjen", joinColumns = @JoinColumn(name = "urun_id"))
	@Column(name = "alerjen", length = 80)
	private Set<String> alerjenler = new HashSet<>();

	@Column(name = "mevcut", nullable = false)
	private boolean mevcut = true;
}
