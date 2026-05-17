package com.aliyilmaz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DtoRestoranIU {

	@NotBlank(message = "Restoran adı zorunludur.")
	@Size(max = 160)
	private String restoranAdi;

	private double enlem;

	private double boylam;

	@Size(max = 255)
	private String adres;

	@Size(max = 1000)
	private String aciklama;
}
