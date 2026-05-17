package com.aliyilmaz.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * HTTP Basic challenge (tarayicida kullanici adi / sifre penceresi) gondermez;
 * JWT bekleyen REST API icin 401 JSON yaniti uretir.
 */
// SONRAYA: 401 JSON entry point — SecurityConfig ile birlikte geri acin.
// @Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException {

		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");

		Map<String, Object> govde = new LinkedHashMap<>();
		govde.put("hataKodu", 401);
		govde.put("mesaj",
				"Bu işlem için giriş yapmanız gerekir. Postman'de Authorization → Bearer Token ile JWT ekleyin.");
		govde.put("yol", request.getRequestURI());
		govde.put("zaman", LocalDateTime.now().toString());
		govde.put("alanHatalari", null);

		response.getWriter().write(objectMapper.writeValueAsString(govde));
	}
}
