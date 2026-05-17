package com.aliyilmaz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DtoKategoriIU {

	@NotBlank(message = "Kategori adı zorunludur.")
	@Size(max = 120)
	private String kategoriAdi;

	private Integer siraNo;
}
