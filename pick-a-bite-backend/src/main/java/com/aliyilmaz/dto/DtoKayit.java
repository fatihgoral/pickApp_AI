package com.aliyilmaz.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DtoKayit {

	@NotBlank(message = "E-posta zorunludur.")
	@Email(message = "Geçerli bir e-posta giriniz.")
	@Size(max = 180)
	private String email;

	@NotBlank(message = "Şifre zorunludur.")
	@Size(min = 6, max = 100, message = "Şifre en az 6, en fazla 100 karakter olmalıdır.")
	private String sifre;

	@Size(max = 80)
	private String ad;

	@Size(max = 80)
	private String soyad;
}
