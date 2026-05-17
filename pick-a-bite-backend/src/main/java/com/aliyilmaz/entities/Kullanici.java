package com.aliyilmaz.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "kullanici")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Kullanici {

	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "email", nullable = false, unique = true, length = 180)
	private String email;

	@Column(name = "sifre_hash", nullable = false)
	private String sifreHash;

	@Column(name = "ad", length = 80)
	private String ad;

	@Column(name = "soyad", length = 80)
	private String soyad;

	@Column(name = "butce")
	private BigDecimal butce;

	@Column(name = "vegan", nullable = false)
	private boolean vegan;

	@Column(name = "vejetaryen", nullable = false)
	private boolean vejetaryen;

	@Column(name = "glutensiz", nullable = false)
	private boolean glutensiz;

	@Column(name = "helal", nullable = false)
	private boolean helal;

	@Column(name = "laktozsuz", nullable = false)
	private boolean laktozsuz;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "kullanici_alerjen", joinColumns = @JoinColumn(name = "kullanici_id"))
	@Column(name = "alerjen", length = 80)
	private Set<String> alerjenler = new HashSet<>();

	@Column(name = "olusturma_tarihi", nullable = false, updatable = false)
	private LocalDateTime olusturmaTarihi;

	@PrePersist
	protected void onCreate() {
		if (olusturmaTarihi == null) {
			olusturmaTarihi = LocalDateTime.now();
		}
		if (alerjenler == null) {
			alerjenler = new HashSet<>();
		}
	}
}
