package com.aliyilmaz.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoHata {

	private int hataKodu;

	private String mesaj;

	private String yol;

	private LocalDateTime zaman;

	private List<Map<String, String>> alanHatalari;
}
