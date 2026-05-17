package com.aliyilmaz.controller;

import java.security.Principal;

import com.aliyilmaz.dto.DtoTercih;

public interface IKullaniciController {

	DtoTercih tercihGetir(Principal principal);

	DtoTercih tercihGuncelle(Principal principal, DtoTercih istek);
}
