package com.aliyilmaz.controller.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aliyilmaz.controller.IAppController;
import com.aliyilmaz.dto.DtoMenu;
import com.aliyilmaz.dto.DtoRestoran;
import com.aliyilmaz.dto.DtoRestoranIU;
import com.aliyilmaz.services.IAppServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/pick-a-bite")
public class AppController implements IAppController {

	private final IAppServices appServices;

	public AppController(IAppServices appServices) {
		this.appServices = appServices;
	}

	@Override
	@GetMapping("/restoranlar")
	public List<DtoRestoran> getAllRestaurant() {
		return appServices.getAllRestaurant();
	}

	@Override
	@GetMapping("/restoranlar/{id}")
	public DtoRestoran restoranGetir(@PathVariable Integer id) {
		return appServices.restoranGetir(id);
	}

	@Override
	@PostMapping("/restoranlar")
	@ResponseStatus(HttpStatus.CREATED)
	public DtoRestoran restoranOlustur(@Valid @RequestBody DtoRestoranIU istek) {
		return appServices.restoranOlustur(istek);
	}

	@Override
	@PutMapping("/restoranlar/{id}")
	public DtoRestoran restoranGuncelle(@PathVariable Integer id, @Valid @RequestBody DtoRestoranIU istek) {
		return appServices.restoranGuncelle(id, istek);
	}

	@Override
	@DeleteMapping("/restoranlar/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void restoranSil(@PathVariable Integer id) {
		appServices.restoranSil(id);
	}

	@Override
	@GetMapping("/restoranlar/yakin")
	public List<DtoRestoran> yakindakiRestoranlar(@RequestParam double enlem,
			@RequestParam double boylam,
			@RequestParam(required = false) Double yaricapKm) {
		double yaricap = (yaricapKm == null || yaricapKm <= 0) ? 5.0 : yaricapKm;
		return appServices.yakindakiRestoranlar(enlem, boylam, yaricap);
	}

	@Override
	@GetMapping("/restoranlar/qr/{qrKod}")
	public DtoMenu qrIleMenuGetir(@PathVariable String qrKod) {
		return appServices.qrIleMenuGetir(qrKod);
	}
}
