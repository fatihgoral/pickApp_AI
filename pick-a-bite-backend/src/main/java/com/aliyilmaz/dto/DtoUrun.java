package com.aliyilmaz.dto;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import lombok.Data;

@Data
public class DtoUrun {

	private Integer id;

	private Integer kategoriId;

	private String urunAdi;

	private String aciklama;

	private BigDecimal fiyat;

	private Integer tahminiKalori;

	private Set<String> alerjenler = new HashSet<>();

	private boolean mevcut;
}
