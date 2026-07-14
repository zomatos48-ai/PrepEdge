package com.prepedge.prepedge_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = "com.prepedge")
@EntityScan("com.prepedge.entity")
@EnableJpaRepositories("com.prepedge.repository")
@EnableAsync
public class PrepedgeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PrepedgeBackendApplication.class, args);
	}

}