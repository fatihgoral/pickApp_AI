package com.aliyilmaz.controller.impl;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.controller.IKullaniciController;
import com.aliyilmaz.dto.DtoTercih;
import com.aliyilmaz.services.IKullaniciServices;

import jakarta.validation.Valid;

// SONRAYA: Tercih uclari (JWT ile) — asagidaki iki anotasyonu geri acin.
// @RestController
// @RequestMapping("/pick-a-bite/kullanici")
public class KullaniciController implements IKullaniciController {

	private final IKullaniciServices kullaniciServices;

	public KullaniciController(IKullaniciServices kullaniciServices) {
		this.kullaniciServices = kullaniciServices;
	}

	@Override
	@GetMapping("/tercihler")
	public DtoTercih tercihGetir(Principal principal) {
		return kullaniciServices.tercihGetir(principal.getName());
	}

	@Override
	@PutMapping("/tercihler")
	public DtoTercih tercihGuncelle(Principal principal, @Valid @RequestBody DtoTercih istek) {
		return kullaniciServices.tercihGuncelle(principal.getName(), istek);
	}
}
