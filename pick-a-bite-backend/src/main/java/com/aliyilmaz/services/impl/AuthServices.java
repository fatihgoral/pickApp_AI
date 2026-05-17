package com.aliyilmaz.services.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aliyilmaz.dto.DtoGiris;
import com.aliyilmaz.dto.DtoKayit;
import com.aliyilmaz.dto.DtoKullanici;
import com.aliyilmaz.dto.DtoTokenYanit;
import com.aliyilmaz.entities.Kullanici;
import com.aliyilmaz.exception.BusinessException;
import com.aliyilmaz.exception.ResourceNotFoundException;
import com.aliyilmaz.repository.KullaniciRepository;
import com.aliyilmaz.security.JwtService;
import com.aliyilmaz.services.IAuthServices;

// SONRAYA: Kayit / giris is mantigi — SecurityConfig + @RestController Auth ile geri acin.
// @Service
public class AuthServices implements IAuthServices {

	private final KullaniciRepository kullaniciRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthServices(KullaniciRepository kullaniciRepository,
			PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager,
			JwtService jwtService) {
		this.kullaniciRepository = kullaniciRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	@Override
	@Transactional
	public DtoTokenYanit kayitOl(DtoKayit istek) {
		if (kullaniciRepository.existsByEmail(istek.getEmail())) {
			throw new BusinessException("Bu e-posta ile zaten bir hesap mevcut.");
		}

		Kullanici kullanici = new Kullanici();
		kullanici.setEmail(istek.getEmail().trim().toLowerCase());
		kullanici.setSifreHash(passwordEncoder.encode(istek.getSifre()));
		kullanici.setAd(istek.getAd());
		kullanici.setSoyad(istek.getSoyad());

		kullanici = kullaniciRepository.save(kullanici);

		String token = jwtService.tokenUret(kullanici.getEmail());
		return new DtoTokenYanit(token, "Bearer", jwtService.getGecerlilikMs(), entityToDto(kullanici));
	}

	@Override
	@Transactional(readOnly = true)
	public DtoTokenYanit girisYap(DtoGiris istek) {
		String email = istek.getEmail().trim().toLowerCase();
		try {
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(email, istek.getSifre()));
		} catch (BadCredentialsException ex) {
			throw new BusinessException("E-posta veya şifre hatalı.");
		}

		Kullanici kullanici = kullaniciRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));

		String token = jwtService.tokenUret(kullanici.getEmail());
		return new DtoTokenYanit(token, "Bearer", jwtService.getGecerlilikMs(), entityToDto(kullanici));
	}

	@Override
	@Transactional(readOnly = true)
	public DtoKullanici mevcutKullanici(String email) {
		Kullanici kullanici = kullaniciRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
		return entityToDto(kullanici);
	}

	private DtoKullanici entityToDto(Kullanici k) {
		DtoKullanici dto = new DtoKullanici();
		dto.setId(k.getId());
		dto.setEmail(k.getEmail());
		dto.setAd(k.getAd());
		dto.setSoyad(k.getSoyad());
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
