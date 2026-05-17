package com.aliyilmaz.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class DtoKategori {

	private Integer id;

	private Integer restoranId;

	private String kategoriAdi;

	private Integer siraNo;

	private List<DtoUrun> urunler = new ArrayList<>();
}
