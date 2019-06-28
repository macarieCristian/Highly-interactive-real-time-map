package ro.licence.cristian.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import javax.annotation.Resource;

@SpringBootApplication
@EnableJpaRepositories(basePackages = {"ro.licence.cristian.persistence.repository"})
@EntityScan(basePackages = {"ro.licence.cristian.persistence.model"})
@ComponentScan(basePackages = {"ro.licence.cristian"})
public class BootStart extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(BootStart.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(BootStart.class);
    }
}
