package com.aliyilmaz.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DtoGiris {

	@NotBlank(message = "E-posta zorunludur.")
	@Email(message = "Geçerli bir e-posta giriniz.")
	private String email;

	@NotBlank(message = "Şifre zorunludur.")
	private String sifre;
}
