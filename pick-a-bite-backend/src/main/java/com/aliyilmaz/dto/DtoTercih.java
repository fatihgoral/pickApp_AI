package com.aliyilmaz.dto;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
public class DtoTercih {

	@DecimalMin(value = "0.0", inclusive = true, message = "Bütçe 0 veya daha büyük olmalıdır.")
	private BigDecimal butce;

	private boolean vegan;

	private boolean vejetaryen;

	private boolean glutensiz;

	private boolean helal;

	private boolean laktozsuz;

	private Set<String> alerjenler = new HashSet<>();
}
