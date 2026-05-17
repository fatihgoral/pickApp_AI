package com.aliyilmaz.controller.impl;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.controller.IMenuController;
import com.aliyilmaz.dto.DtoKategori;
import com.aliyilmaz.dto.DtoKategoriIU;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoUrun;
import com.aliyilmaz.dto.DtoUrunIU;
import com.aliyilmaz.services.IMenuServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/pick-a-bite")
public class MenuController implements IMenuController {

	private final IMenuServices menuServices;

	public MenuController(IMenuServices menuServices) {
		this.menuServices = menuServices;
	}

	@Override
	@GetMapping("/restoranlar/{restoranId}/menu")
	public DtoMenu menuGetir(@PathVariable Integer restoranId) {
		return menuServices.menuGetir(restoranId);
	}

	@Override
	@PostMapping("/restoranlar/{restoranId}/kategoriler")
	@ResponseStatus(HttpStatus.CREATED)
	public DtoKategori kategoriOlustur(@PathVariable Integer restoranId,
			@Valid @RequestBody DtoKategoriIU istek) {
		return menuServices.kategoriOlustur(restoranId, istek);
	}

	@Override
	@PutMapping("/kategoriler/{kategoriId}")
	public DtoKategori kategoriGuncelle(@PathVariable Integer kategoriId,
			@Valid @RequestBody DtoKategoriIU istek) {
		return menuServices.kategoriGuncelle(kategoriId, istek);
	}

	@Override
	@DeleteMapping("/kategoriler/{kategoriId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void kategoriSil(@PathVariable Integer kategoriId) {
		menuServices.kategoriSil(kategoriId);
	}

	@Override
	@PostMapping("/kategoriler/{kategoriId}/urunler")
	@ResponseStatus(HttpStatus.CREATED)
	public DtoUrun urunOlustur(@PathVariable Integer kategoriId,
			@Valid @RequestBody DtoUrunIU istek) {
		return menuServices.urunOlustur(kategoriId, istek);
	}

	@Override
	@PutMapping("/urunler/{urunId}")
	public DtoUrun urunGuncelle(@PathVariable Integer urunId,
			@Valid @RequestBody DtoUrunIU istek) {
		return menuServices.urunGuncelle(urunId, istek);
	}

	@Override
	@DeleteMapping("/urunler/{urunId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void urunSil(@PathVariable Integer urunId) {
		menuServices.urunSil(urunId);
	}
}
