package com.aliyilmaz.dto;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DtoUrunIU {

	@NotBlank(message = "Ürün adı zorunludur.")
	@Size(max = 160)
	private String urunAdi;

	@Size(max = 1000)
	private String aciklama;

	@NotNull(message = "Fiyat zorunludur.")
	@DecimalMin(value = "0.0", inclusive = true, message = "Fiyat 0 veya daha büyük olmalıdır.")
	private BigDecimal fiyat;

	private Integer tahminiKalori;

	private Set<String> alerjenler = new HashSet<>();

	private Boolean mevcut;
}
