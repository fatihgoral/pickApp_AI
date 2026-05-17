package com.aliyilmaz.exception;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.aliyilmaz.dto.DtoHata;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<DtoHata> notFound(ResourceNotFoundException ex, HttpServletRequest req) {
		return olustur(HttpStatus.NOT_FOUND, ex.getMessage(), req, null);
	}

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<DtoHata> business(BusinessException ex, HttpServletRequest req) {
		return olustur(HttpStatus.BAD_REQUEST, ex.getMessage(), req, null);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<DtoHata> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
		List<Map<String, String>> alanHatalari = new ArrayList<>();
		for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
			alanHatalari.add(Map.of(
					"alan", fe.getField(),
					"mesaj", fe.getDefaultMessage() == null ? "Geçersiz değer." : fe.getDefaultMessage()));
		}
		return olustur(HttpStatus.BAD_REQUEST, "Girdiğiniz bilgilerde bazı hatalar var.", req, alanHatalari);
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<DtoHata> badCredentials(BadCredentialsException ex, HttpServletRequest req) {
		return olustur(HttpStatus.UNAUTHORIZED, "E-posta veya şifre hatalı.", req, null);
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<DtoHata> auth(AuthenticationException ex, HttpServletRequest req) {
		return olustur(HttpStatus.UNAUTHORIZED, "Kimlik doğrulaması başarısız.", req, null);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<DtoHata> accessDenied(AccessDeniedException ex, HttpServletRequest req) {
		return olustur(HttpStatus.FORBIDDEN, "Bu işlem için yetkiniz yok.", req, null);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<DtoHata> illegalArg(IllegalArgumentException ex, HttpServletRequest req) {
		return olustur(HttpStatus.BAD_REQUEST, ex.getMessage(), req, null);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<DtoHata> generic(Exception ex, HttpServletRequest req, WebRequest webReq) {
		return olustur(HttpStatus.INTERNAL_SERVER_ERROR,
				"Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.", req, null);
	}

	private ResponseEntity<DtoHata> olustur(HttpStatus durum, String mesaj, HttpServletRequest req,
			List<Map<String, String>> alanHatalari) {
		DtoHata hata = new DtoHata(
				durum.value(),
				mesaj,
				req.getRequestURI(),
				LocalDateTime.now(),
				alanHatalari);
		return ResponseEntity.status(durum).body(hata);
	}
}
