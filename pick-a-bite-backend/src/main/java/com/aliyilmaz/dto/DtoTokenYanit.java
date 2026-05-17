package com.aliyilmaz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoTokenYanit {

	private String token;

	private String tokenTuru;

	private long gecerlilikMs;

	private DtoKullanici kullanici;
}
