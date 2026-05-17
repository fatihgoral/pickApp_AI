package com.aliyilmaz.services.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.dto.DtoKategori;
import com.aliyilmaz.dto.DtoKategoriIU;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoRestoran;
import com.aliyilmaz.dto.DtoUrun;
import com.aliyilmaz.dto.DtoUrunIU;
import com.aliyilmaz.entities.Kategori;
import com.aliyilmaz.entities.Restoran;
import com.aliyilmaz.entities.Urun;
import com.aliyilmaz.exception.ResourceNotFoundException;
import com.aliyilmaz.repository.AppRepository;
import com.aliyilmaz.repository.KategoriRepository;
import com.aliyilmaz.repository.UrunRepository;
import com.aliyilmaz.services.IMenuServices;

@Service
public class MenuServices implements IMenuServices {

	private final AppRepository appRepository;
	private final KategoriRepository kategoriRepository;
	private final UrunRepository urunRepository;

	public MenuServices(AppRepository appRepository,
			KategoriRepository kategoriRepository,
			UrunRepository urunRepository) {
		this.appRepository = appRepository;
		this.kategoriRepository = kategoriRepository;
		this.urunRepository = urunRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public DtoMenu menuGetir(Integer restoranId) {
		Restoran r = appRepository.findById(restoranId)
				.orElseThrow(() -> new ResourceNotFoundException("Restoran bulunamadı: " + restoranId));

		DtoMenu menu = new DtoMenu();
		menu.setRestoran(restoranDto(r));

		List<Kategori> kategoriler = kategoriRepository.findByRestoranIdOrderBySiraNoAsc(r.getId());
		List<DtoKategori> sonuc = new ArrayList<>();
		for (Kategori k : kategoriler) {
			sonuc.add(kategoriToDto(k));
		}
		menu.setKategoriler(sonuc);
		return menu;
	}

	@Override
	@Transactional
	public DtoKategori kategoriOlustur(Integer restoranId, DtoKategoriIU istek) {
		Restoran r = appRepository.findById(restoranId)
				.orElseThrow(() -> new ResourceNotFoundException("Restoran bulunamadı: " + restoranId));

		Kategori k = new Kategori();
		k.setRestoran(r);
		k.setKategoriAdi(istek.getKategoriAdi());
		k.setSiraNo(istek.getSiraNo() == null ? 0 : istek.getSiraNo());
		k = kategoriRepository.save(k);
		return kategoriToDto(k);
	}

	@Override
	@Transactional
	public DtoKategori kategoriGuncelle(Integer kategoriId, DtoKategoriIU istek) {
		Kategori k = kategoriRepository.findById(kategoriId)
				.orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + kategoriId));
		k.setKategoriAdi(istek.getKategoriAdi());
		if (istek.getSiraNo() != null) {
			k.setSiraNo(istek.getSiraNo());
		}
		return kategoriToDto(kategoriRepository.save(k));
	}

	@Override
	@Transactional
	public void kategoriSil(Integer kategoriId) {
		if (!kategoriRepository.existsById(kategoriId)) {
			throw new ResourceNotFoundException("Kategori bulunamadı: " + kategoriId);
		}
		kategoriRepository.deleteById(kategoriId);
	}

	@Override
	@Transactional
	public DtoUrun urunOlustur(Integer kategoriId, DtoUrunIU istek) {
		Kategori k = kategoriRepository.findById(kategoriId)
				.orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + kategoriId));

		Urun u = new Urun();
		u.setKategori(k);
		uygula(u, istek);
		u = urunRepository.save(u);
		return urunToDto(u);
	}

	@Override
	@Transactional
	public DtoUrun urunGuncelle(Integer urunId, DtoUrunIU istek) {
		Urun u = urunRepository.findById(urunId)
				.orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + urunId));
		uygula(u, istek);
		return urunToDto(urunRepository.save(u));
	}

	@Override
	@Transactional
	public void urunSil(Integer urunId) {
		if (!urunRepository.existsById(urunId)) {
			throw new ResourceNotFoundException("Ürün bulunamadı: " + urunId);
		}
		urunRepository.deleteById(urunId);
	}

	private void uygula(Urun u, DtoUrunIU istek) {
		u.setUrunAdi(istek.getUrunAdi());
		u.setAciklama(istek.getAciklama());
		u.setFiyat(istek.getFiyat());
		u.setTahminiKalori(istek.getTahminiKalori());
		u.setAlerjenler(istek.getAlerjenler() == null ? new HashSet<>() : new HashSet<>(istek.getAlerjenler()));
		u.setMevcut(istek.getMevcut() == null ? true : istek.getMevcut());
	}

	private DtoRestoran restoranDto(Restoran r) {
		DtoRestoran dto = new DtoRestoran();
		dto.setId(r.getId());
		dto.setRestoranAdi(r.getRestoranAdi());
		dto.setEnlem(r.getEnlem());
		dto.setBoylam(r.getBoylam());
		dto.setQrKod(r.getQrKod());
		dto.setAdres(r.getAdres());
		dto.setAciklama(r.getAciklama());
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
}
