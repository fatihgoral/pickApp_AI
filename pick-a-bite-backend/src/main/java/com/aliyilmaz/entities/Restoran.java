package com.aliyilmaz.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "restoran")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restoran {

	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "restoran_adi", nullable = false)
	private String restoranAdi;

	@Column(name = "enlem", nullable = false)
	private double enlem;

	@Column(name = "boylam", nullable = false)
	private double boylam;

	@Column(name = "qr_kod", nullable = false, unique = true, updatable = false, length = 64)
	private String qrKod;

	@Column(name = "adres")
	private String adres;

	@Column(name = "aciklama", length = 1000)
	private String aciklama;

	@Column(name = "olusturma_tarihi", nullable = false, updatable = false)
	private LocalDateTime olusturmaTarihi;

	@OneToMany(mappedBy = "restoran", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Kategori> kategoriler = new ArrayList<>();

	@PrePersist
	protected void onCreate() {
		if (qrKod == null || qrKod.isBlank()) {
			qrKod = UUID.randomUUID().toString();
		}
		if (olusturmaTarihi == null) {
			olusturmaTarihi = LocalDateTime.now();
		}
	}
}
