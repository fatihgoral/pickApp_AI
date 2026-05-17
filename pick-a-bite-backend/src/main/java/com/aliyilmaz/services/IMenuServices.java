package com.aliyilmaz.services;

import com.aliyilmaz.dto.DtoKategori;
import com.aliyilmaz.dto.DtoKategoriIU;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoUrun;
import com.aliyilmaz.dto.DtoUrunIU;

public interface IMenuServices {

	DtoMenu menuGetir(Integer restoranId);

	DtoKategori kategoriOlustur(Integer restoranId, DtoKategoriIU istek);

	DtoKategori kategoriGuncelle(Integer kategoriId, DtoKategoriIU istek);

	void kategoriSil(Integer kategoriId);

	DtoUrun urunOlustur(Integer kategoriId, DtoUrunIU istek);

	DtoUrun urunGuncelle(Integer urunId, DtoUrunIU istek);

	void urunSil(Integer urunId);
}
