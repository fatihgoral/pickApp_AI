package com.aliyilmaz.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(
		scanBasePackages = "com.aliyilmaz",
		exclude = { SecurityAutoConfiguration.class })
@EntityScan(basePackages = "com.aliyilmaz.entities")
@EnableJpaRepositories(basePackages = "com.aliyilmaz.repository")
// SONRAYA: Guvenligi tekrar acmak icin yukaridaki exclude'u ve asagidaki aciklamayi kaldirin,
// com.aliyilmaz.config.SecurityConfig dosyasindaki yorumlari geri acin.
public class PickABiteApplication {

	public static void main(String[] args) {
		SpringApplication.run(PickABiteApplication.class, args);
	}

}
