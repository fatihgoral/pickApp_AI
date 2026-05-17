package com.aliyilmaz.controller;

import java.util.List;

import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoRestoran;
import com.aliyilmaz.dto.DtoRestoranIU;

public interface IAppController {

	List<DtoRestoran> getAllRestaurant();

	DtoRestoran restoranGetir(Integer id);

	DtoRestoran restoranOlustur(DtoRestoranIU istek);

	DtoRestoran restoranGuncelle(Integer id, DtoRestoranIU istek);

	void restoranSil(Integer id);

	List<DtoRestoran> yakindakiRestoranlar(double enlem, double boylam, Double yaricapKm);

	DtoMenu qrIleMenuGetir(String qrKod);
}
