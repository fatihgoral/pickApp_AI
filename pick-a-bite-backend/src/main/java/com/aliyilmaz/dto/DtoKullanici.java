package com.aliyilmaz.dto;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import lombok.Data;

@Data
public class DtoKullanici {

	private Integer id;

	private String email;

	private String ad;

	private String soyad;

	private BigDecimal butce;

	private boolean vegan;

	private boolean vejetaryen;

	private boolean glutensiz;

	private boolean helal;

	private boolean laktozsuz;

	private Set<String> alerjenler = new HashSet<>();
}
