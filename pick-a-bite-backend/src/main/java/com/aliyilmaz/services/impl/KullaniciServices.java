package com.aliyilmaz.services.impl;

import java.util.HashSet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.dto.DtoTercih;
import com.aliyilmaz.entities.Kullanici;
import com.aliyilmaz.exception.ResourceNotFoundException;
import com.aliyilmaz.repository.KullaniciRepository;
import com.aliyilmaz.services.IKullaniciServices;

// SONRAYA: Kullanici tercihleri — KullaniciController ile geri acin.
// @Service
public class KullaniciServices implements IKullaniciServices {

	private final KullaniciRepository kullaniciRepository;

	public KullaniciServices(KullaniciRepository kullaniciRepository) {
		this.kullaniciRepository = kullaniciRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public DtoTercih tercihGetir(String email) {
		return entityToDto(bul(email));
	}

	@Override
	@Transactional
	public DtoTercih tercihGuncelle(String email, DtoTercih istek) {
		Kullanici k = bul(email);
		k.setButce(istek.getButce());
		k.setVegan(istek.isVegan());
		k.setVejetaryen(istek.isVejetaryen());
		k.setGlutensiz(istek.isGlutensiz());
		k.setHelal(istek.isHelal());
		k.setLaktozsuz(istek.isLaktozsuz());
		k.setAlerjenler(istek.getAlerjenler() == null ? new HashSet<>() : new HashSet<>(istek.getAlerjenler()));
		return entityToDto(kullaniciRepository.save(k));
	}

	private Kullanici bul(String email) {
		return kullaniciRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
	}

	private DtoTercih entityToDto(Kullanici k) {
		DtoTercih dto = new DtoTercih();
		dto.setButce(k.getButce());
		dto.setVegan(k.isVegan());
		dto.setVejetaryen(k.isVejetaryen());
		dto.setGlutensiz(k.isGlutensiz());
		dto.setHelal(k.isHelal());
		dto.setLaktozsuz(k.isLaktozsuz());
		dto.setAlerjenler(k.getAlerjenler());
		return dto;
	}
}
