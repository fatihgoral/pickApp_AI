package com.aliyilmaz.controller.impl;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.controller.IAuthController;
import com.aliyilmaz.dto.DtoGiris;
import com.aliyilmaz.dto.DtoKayit;
import com.aliyilmaz.dto.DtoKullanici;
import com.aliyilmaz.dto.DtoTokenYanit;
import com.aliyilmaz.services.IAuthServices;

import jakarta.validation.Valid;

// SONRAYA: Kayit / giris / JWT — asagidaki iki anotasyonu geri acin.
// @RestController
// @RequestMapping("/pick-a-bite/auth")
public class AuthController implements IAuthController {

	private final IAuthServices authServices;

	public AuthController(IAuthServices authServices) {
		this.authServices = authServices;
	}

	@Override
	@PostMapping("/kayit")
	public DtoTokenYanit kayit(@Valid @RequestBody DtoKayit istek) {
		return authServices.kayitOl(istek);
	}

	@Override
	@PostMapping("/giris")
	public DtoTokenYanit giris(@Valid @RequestBody DtoGiris istek) {
		return authServices.girisYap(istek);
	}

	@Override
	@GetMapping("/ben")
	public DtoKullanici ben(Principal principal) {
		return authServices.mevcutKullanici(principal.getName());
	}
}
