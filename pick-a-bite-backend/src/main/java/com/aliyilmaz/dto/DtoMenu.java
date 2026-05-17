package com.aliyilmaz.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class DtoMenu {

	private DtoRestoran restoran;

	private List<DtoKategori> kategoriler = new ArrayList<>();
}
