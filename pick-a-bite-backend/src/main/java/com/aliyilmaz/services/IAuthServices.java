package com.aliyilmaz.services;

import com.aliyilmaz.dto.DtoGiris;
import com.aliyilmaz.dto.DtoKayit;
import com.aliyilmaz.dto.DtoKullanici;
import com.aliyilmaz.dto.DtoTokenYanit;

public interface IAuthServices {

	DtoTokenYanit kayitOl(DtoKayit istek);

	DtoTokenYanit girisYap(DtoGiris istek);

	DtoKullanici mevcutKullanici(String email);
}
