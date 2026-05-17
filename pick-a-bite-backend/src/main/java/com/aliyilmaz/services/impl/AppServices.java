package com.aliyilmaz.services.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.dto.DtoKategori;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoRestoran;
import com.aliyilmaz.dto.DtoRestoranIU;
import com.aliyilmaz.dto.DtoUrun;
import com.aliyilmaz.entities.Kategori;
import com.aliyilmaz.entities.Restoran;
import com.aliyilmaz.entities.Urun;
import com.aliyilmaz.exception.ResourceNotFoundException;
import com.aliyilmaz.repository.AppRepository;
import com.aliyilmaz.repository.KategoriRepository;
import com.aliyilmaz.services.IAppServices;

@Service
public class AppServices implements IAppServices {

	private static final double DUNYA_YARICAP_KM = 6371.0;

	private final AppRepository appRepository;
	private final KategoriRepository kategoriRepository;

	public AppServices(AppRepository appRepository, KategoriRepository kategoriRepository) {
		this.appRepository = appRepository;
		this.kategoriRepository = kategoriRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public List<DtoRestoran> getAllRestaurant() {
		List<Restoran> liste = appRepository.findAll();
		List<DtoRestoran> sonuc = new ArrayList<>();
		for (Restoran r : liste) {
			sonuc.add(toDto(r, null));
		}
		return sonuc;
	}

	@Override
	@Transactional(readOnly = true)
	public DtoRestoran restoranGetir(Integer id) {
		Restoran r = appRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Restoran bulunamadı: " + id));
		return toDto(r, null);
	}

	@Override
	@Transactional
	public DtoRestoran restoranOlustur(DtoRestoranIU istek) {
		Restoran r = new Restoran();
		uygula(r, istek);
		r = appRepository.save(r);
		return toDto(r, null);
	}

	@Override
	@Transactional
	public DtoRestoran restoranGuncelle(Integer id, DtoRestoranIU istek) {
		Restoran r = appRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Restoran bulunamadı: " + id));
		uygula(r, istek);
		r = appRepository.save(r);
		return toDto(r, null);
	}

	@Override
	@Transactional
	public void restoranSil(Integer id) {
		if (!appRepository.existsById(id)) {
			throw new ResourceNotFoundException("Restoran bulunamadı: " + id);
		}
		appRepository.deleteById(id);
	}

	@Override
	@Transactional(readOnly = true)
	public List<DtoRestoran> yakindakiRestoranlar(double enlem, double boylam, double yaricapKm) {
		List<Restoran> liste = appRepository.yakindakiRestoranlar(enlem, boylam, yaricapKm);
		List<DtoRestoran> sonuc = new ArrayList<>();
		for (Restoran r : liste) {
			double mesafe = haversineKm(enlem, boylam, r.getEnlem(), r.getBoylam());
			sonuc.add(toDto(r, mesafe));
		}
		return sonuc;
	}

	@Override
	@Transactional(readOnly = true)
	public DtoMenu qrIleMenuGetir(String qrKod) {
		Restoran r = appRepository.findByQrKod(qrKod)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Bu QR kod sisteme kayıtlı bir restorana ait değil."));

		DtoMenu menu = new DtoMenu();
		menu.setRestoran(toDto(r, null));

		List<Kategori> kategoriler = kategoriRepository.findByRestoranIdOrderBySiraNoAsc(r.getId());
		List<DtoKategori> dtoKategoriler = new ArrayList<>();
		for (Kategori k : kategoriler) {
			dtoKategoriler.add(kategoriToDto(k));
		}
		menu.setKategoriler(dtoKategoriler);
		return menu;
	}

	private void uygula(Restoran r, DtoRestoranIU istek) {
		r.setRestoranAdi(istek.getRestoranAdi());
		r.setEnlem(istek.getEnlem());
		r.setBoylam(istek.getBoylam());
		r.setAdres(istek.getAdres());
		r.setAciklama(istek.getAciklama());
	}

	private DtoRestoran toDto(Restoran r, Double mesafeKm) {
		DtoRestoran dto = new DtoRestoran();
		dto.setId(r.getId());
		dto.setRestoranAdi(r.getRestoranAdi());
		dto.setEnlem(r.getEnlem());
		dto.setBoylam(r.getBoylam());
		dto.setQrKod(r.getQrKod());
		dto.setAdres(r.getAdres());
		dto.setAciklama(r.getAciklama());
		dto.setMesafeKm(mesafeKm);
		return dto;
	}

	private DtoKategori kategoriToDto(Kategori k) {
		DtoKategori dto = new DtoKategori();
		dto.setId(k.getId());
		dto.setRestoranId(k.getRestoran().getId());
		dto.setKategoriAdi(k.getKategoriAdi());
		dto.setSiraNo(k.getSiraNo());
		List<DtoUrun> urunler = new ArrayList<>();
		for (Urun u : k.getUrunler()) {
			urunler.add(urunToDto(u));
		}
		dto.setUrunler(urunler);
		return dto;
	}

	private DtoUrun urunToDto(Urun u) {
		DtoUrun dto = new DtoUrun();
		dto.setId(u.getId());
		dto.setKategoriId(u.getKategori().getId());
		dto.setUrunAdi(u.getUrunAdi());
		dto.setAciklama(u.getAciklama());
		dto.setFiyat(u.getFiyat());
		dto.setTahminiKalori(u.getTahminiKalori());
		dto.setAlerjenler(u.getAlerjenler());
		dto.setMevcut(u.isMevcut());
		return dto;
	}

	private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
		double dLat = Math.toRadians(lat2 - lat1);
		double dLon = Math.toRadians(lon2 - lon1);
		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
				+ Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
						* Math.sin(dLon / 2) * Math.sin(dLon / 2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return DUNYA_YARICAP_KM * c;
	}
}
