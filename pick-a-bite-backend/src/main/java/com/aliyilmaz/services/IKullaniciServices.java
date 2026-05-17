package com.aliyilmaz.services;

import com.aliyilmaz.dto.DtoTercih;

public interface IKullaniciServices {

	DtoTercih tercihGetir(String email);

	DtoTercih tercihGuncelle(String email, DtoTercih istek);
}
