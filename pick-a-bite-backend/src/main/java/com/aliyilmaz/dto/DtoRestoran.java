package com.aliyilmaz.dto;

import lombok.Data;

@Data
public class DtoRestoran {

	private Integer id;

	private String restoranAdi;

	private double enlem;

	private double boylam;

	private String qrKod;

	private String adres;

	private String aciklama;

	private Double mesafeKm;
}
