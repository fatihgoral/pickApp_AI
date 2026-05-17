package com.aliyilmaz.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

// SONRAYA: JWT uretim — AuthServices ile birlikte geri acin.
// @Service
public class JwtService {

	private final SecretKey signingKey;
	private final long expirationMs;

	public JwtService(@Value("${jwt.secret}") String secret,
			@Value("${jwt.expirationMs}") long expirationMs) {
		byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
		this.signingKey = Keys.hmacShaKeyFor(keyBytes);
		this.expirationMs = expirationMs;
	}

	public String tokenUret(String email) {
		Date simdi = new Date();
		Date bitis = new Date(simdi.getTime() + expirationMs);
		return Jwts.builder()
				.subject(email)
				.issuedAt(simdi)
				.expiration(bitis)
				.signWith(signingKey)
				.compact();
	}

	public String emailCikar(String token) {
		return claimCikar(token, Claims::getSubject);
	}

	public boolean tokenGecerliMi(String token) {
		try {
			Date bitis = claimCikar(token, Claims::getExpiration);
			return bitis != null && bitis.after(new Date());
		} catch (JwtException | IllegalArgumentException ex) {
			return false;
		}
	}

	public long getGecerlilikMs() {
		return expirationMs;
	}

	private <T> T claimCikar(String token, Function<Claims, T> cozumleyici) {
		Claims claims = Jwts.parser()
				.verifyWith(signingKey)
				.build()
				.parseSignedClaims(token)
				.getPayload();
		return cozumleyici.apply(claims);
	}
}
