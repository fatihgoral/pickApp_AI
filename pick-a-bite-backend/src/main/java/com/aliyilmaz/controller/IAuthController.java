package com.aliyilmaz.controller;

import java.security.Principal;

import com.aliyilmaz.dto.DtoGiris;
import com.aliyilmaz.dto.DtoKayit;
import com.aliyilmaz.dto.DtoKullanici;
import com.aliyilmaz.dto.DtoTokenYanit;

public interface IAuthController {

	DtoTokenYanit kayit(DtoKayit istek);

	DtoTokenYanit giris(DtoGiris istek);

	DtoKullanici ben(Principal principal);
}
