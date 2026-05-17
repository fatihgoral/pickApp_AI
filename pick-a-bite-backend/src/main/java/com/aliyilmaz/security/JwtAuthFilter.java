package com.aliyilmaz.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// SONRAYA: Authorization (Bearer JWT) filtresi — geri acin.
// @Component
public class JwtAuthFilter extends OncePerRequestFilter {

	private static final String BEARER_ON_EKI = "Bearer ";

	private final JwtService jwtService;
	private final CustomUserDetailsService userDetailsService;

	public JwtAuthFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
		this.jwtService = jwtService;
		this.userDetailsService = userDetailsService;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest istek, HttpServletResponse yanit, FilterChain zincir)
			throws ServletException, IOException {

		String authHeader = istek.getHeader("Authorization");
		if (authHeader == null || !authHeader.startsWith(BEARER_ON_EKI)) {
			zincir.doFilter(istek, yanit);
			return;
		}

		String token = authHeader.substring(BEARER_ON_EKI.length());

		try {
			if (jwtService.tokenGecerliMi(token)
					&& SecurityContextHolder.getContext().getAuthentication() == null) {
				String email = jwtService.emailCikar(token);
				UserDetails userDetails = userDetailsService.loadUserByUsername(email);

				UsernamePasswordAuthenticationToken kimlik = new UsernamePasswordAuthenticationToken(
						userDetails, null, userDetails.getAuthorities());
				kimlik.setDetails(new WebAuthenticationDetailsSource().buildDetails(istek));
				SecurityContextHolder.getContext().setAuthentication(kimlik);
			}
		} catch (Exception ex) {
			SecurityContextHolder.clearContext();
		}

		zincir.doFilter(istek, yanit);
	}
}
