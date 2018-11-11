package ro.licence.cristian.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = {"ro.licence.cristian.persistence.repository"})
@EntityScan(basePackages = {"ro.licence.cristian.persistence.model"})
@ComponentScan(basePackages = {"ro.licence.cristian"})
public class BootStart {
    public static void main(String[] args) {
        SpringApplication.run(BootStart.class);
    }
}
