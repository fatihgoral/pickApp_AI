package com.aliyilmaz.exception;

public class ResourceNotFoundException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public ResourceNotFoundException(String mesaj) {
		super(mesaj);
	}
}
