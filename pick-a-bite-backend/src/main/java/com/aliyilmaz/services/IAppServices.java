package com.aliyilmaz.services;

import java.util.List;

import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoRestoran;
import com.aliyilmaz.dto.DtoRestoranIU;

public interface IAppServices {

	List<DtoRestoran> getAllRestaurant();

	DtoRestoran restoranGetir(Integer id);

	DtoRestoran restoranOlustur(DtoRestoranIU istek);

	DtoRestoran restoranGuncelle(Integer id, DtoRestoranIU istek);

	void restoranSil(Integer id);

	List<DtoRestoran> yakindakiRestoranlar(double enlem, double boylam, double yaricapKm);

	DtoMenu qrIleMenuGetir(String qrKod);
}
