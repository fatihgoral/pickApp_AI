package com.aliyilmaz.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.aliyilmaz.entities.Kullanici;
import com.aliyilmaz.repository.KullaniciRepository;

// SONRAYA: Spring Security kullanici yukleme — geri acin.
// @Service
public class CustomUserDetailsService implements UserDetailsService {

	private final KullaniciRepository kullaniciRepository;

	public CustomUserDetailsService(KullaniciRepository kullaniciRepository) {
		this.kullaniciRepository = kullaniciRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		Kullanici kullanici = kullaniciRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı: " + email));

		return new User(
				kullanici.getEmail(),
				kullanici.getSifreHash(),
				List.of(new SimpleGrantedAuthority("ROLE_KULLANICI")));
	}
}
