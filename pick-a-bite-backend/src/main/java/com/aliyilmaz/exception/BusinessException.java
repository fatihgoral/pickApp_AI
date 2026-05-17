package com.aliyilmaz.exception;

public class BusinessException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public BusinessException(String mesaj) {
		super(mesaj);
	}
}
